import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import sharp from "sharp";

/**
 * Azure Storage Service for file management
 * Following Azure best practices for security and performance
 */
export class AzureStorageService {
  constructor() {
    this.blobServiceClient = null;
    this.sharedKeyCredential = null;
    this.accountName = null;
    this.containerName =
      process.env.AZURE_STORAGE_CONTAINER_NAME || "profile-pictures";
    this.isConfigured = false;

    this._initializeClient();
  }

  /**
   * Initialize Azure Storage client with proper credentials
   * @private
   */
  _initializeClient() {
    try {
      const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
      const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
      const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

      if (!connectionString && (!accountName || !accountKey)) {
        console.warn(
          "⚠️ Azure Storage not configured. File uploads will be disabled."
        );
        console.warn(
          "Please set either AZURE_STORAGE_CONNECTION_STRING or both AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY"
        );
        return;
      }

      // Method 1: Using connection string (preferred for development)
      if (connectionString) {
        this.blobServiceClient =
          BlobServiceClient.fromConnectionString(connectionString);

        // Extract account name and key from connection string for SAS generation
        const connStringParams = this._parseConnectionString(connectionString);
        if (connStringParams.AccountName && connStringParams.AccountKey) {
          this.accountName = connStringParams.AccountName;
          this.sharedKeyCredential = new StorageSharedKeyCredential(
            connStringParams.AccountName,
            connStringParams.AccountKey
          );
        }
      }
      // Method 2: Using account name and key directly
      else if (accountName && accountKey) {
        this.accountName = accountName;
        this.sharedKeyCredential = new StorageSharedKeyCredential(
          accountName,
          accountKey
        );
        this.blobServiceClient = new BlobServiceClient(
          `https://${accountName}.blob.core.windows.net`,
          this.sharedKeyCredential
        );
      }

      this.isConfigured = true;
      console.log("✅ Azure Storage service initialized successfully");
      console.log(`📦 Container: ${this.containerName}`);
      console.log(
        `🔑 SAS Generation: ${
          this.sharedKeyCredential ? "Enabled" : "Disabled"
        }`
      );
    } catch (error) {
      console.error("❌ Failed to initialize Azure Storage:", error);
      this.isConfigured = false;
    }
  }

  /**
   * Parse connection string to extract account name and key
   * @private
   */
  _parseConnectionString(connectionString) {
    const params = {};
    connectionString.split(";").forEach((part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        params[key] = value;
      }
    });
    return params;
  }

  /**
   * Upload profile picture with optimization
   * @param {number} userId - User ID
   * @param {Object} file - Multer file object
   * @returns {Promise<Object>} Upload result
   */
  async uploadProfilePicture(userId, file) {
    try {
      if (!this.isConfigured) {
        throw new Error("Azure Storage not configured");
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const fileName = `profile-${userId}-${uuidv4()}${fileExtension}`;

      // Optimize image using Sharp
      const optimizedBuffer = await this._optimizeImage(
        file.buffer,
        file.mimetype
      );

      // Get container client
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName
      );

      // Create container if it doesn't exist (without public access)
      const createContainerResponse = await containerClient.createIfNotExists({
        // Don't set access property to keep it private by default
        metadata: {
          purpose: "Profile pictures storage",
          created: new Date().toISOString(),
        },
      });

      // if (createContainerResponse.succeeded) {
      //   console.log(
      //     `✅ Container '${this.containerName}' created successfully`
      //   );
      // }

      // Get blob client
      const blobClient = containerClient.getBlockBlobClient(fileName);

      // Upload with metadata and proper headers
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
          blobCacheControl: "public, max-age=31536000", // Cache for 1 year
          blobContentDisposition: `inline; filename="${file.originalname}"`,
        },
        metadata: {
          userId: userId.toString(),
          originalName: file.originalname,
          uploadDate: new Date().toISOString(),
          optimized: "true",
          fileSize: optimizedBuffer.length.toString(),
          originalSize: file.size.toString(),
        },
        tags: {
          category: "profile-picture",
          userId: userId.toString(),
          uploadYear: new Date().getFullYear().toString(),
        },
      };

      const uploadResponse = await blobClient.upload(
        optimizedBuffer,
        optimizedBuffer.length,
        uploadOptions
      );

      // Generate SAS URL for secure access
      let accessUrl = blobClient.url;
      if (this.sharedKeyCredential) {
        try {
          accessUrl = await this.generateSasUrl(blobClient.url, 8760); // 1 year
        } catch (sasError) {
          console.warn(
            "⚠️ SAS URL generation failed, using direct URL:",
            sasError.message
          );
          // Fallback to direct URL (works if container/blob has public access)
        }
      }

      const result = {
        url: accessUrl,
        directUrl: blobClient.url,
        fileName: fileName,
        size: optimizedBuffer.length,
        originalSize: file.size,
        uploadId: uploadResponse.requestId,
        etag: uploadResponse.etag,
        lastModified: uploadResponse.lastModified,
        hasSasUrl: accessUrl !== blobClient.url,
      };

      // console.log(`✅ Profile picture uploaded successfully: ${fileName}`);
      // console.log(`🔗 Access URL: ${accessUrl.substring(0, 50)}...`);

      return result;
    } catch (error) {
      console.error("❌ Failed to upload profile picture:", error);
      throw new Error(`Failed to upload profile picture: ${error.message}`);
    }
  }

  /**
   * Generate SAS URL for secure temporary access
   * @param {string} blobUrl - Blob URL
   * @param {number} expiryHours - Hours until expiry (default: 24)
   * @returns {Promise<string>} SAS URL
   */
  async generateSasUrl(blobUrl, expiryHours = 24) {
    try {
      if (!this.isConfigured || !this.sharedKeyCredential) {
        throw new Error("SAS generation not available - missing credentials");
      }

      const blobName = this._extractBlobNameFromUrl(blobUrl);
      if (!blobName) {
        throw new Error("Invalid blob URL");
      }

      const startsOn = new Date();
      const expiresOn = new Date(
        startsOn.valueOf() + expiryHours * 60 * 60 * 1000
      );

      const sasOptions = {
        containerName: this.containerName,
        blobName: blobName,
        permissions: BlobSASPermissions.parse("r"), // Read permission only
        startsOn: startsOn,
        expiresOn: expiresOn,
        protocol: "https", // HTTPS only for security
      };

      // Generate SAS token
      const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        this.sharedKeyCredential
      ).toString();

      const sasUrl = `${blobUrl}?${sasToken}`;

      // console.log(`🔑 SAS URL generated (expires: ${expiresOn.toISOString()})`);

      return sasUrl;
    } catch (error) {
      console.error("❌ Failed to generate SAS URL:", error);
      throw new Error(`Failed to generate SAS URL: ${error.message}`);
    }
  }

  /**
   * Delete file from Azure Storage
   * @param {string} fileUrl - File URL (can include SAS token)
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(fileUrl) {
    try {
      if (!this.isConfigured) {
        console.warn("Azure Storage not configured, skipping file deletion");
        return false;
      }

      const blobName = this._extractBlobNameFromUrl(fileUrl);
      if (!blobName) {
        console.warn("Could not extract blob name from URL:", fileUrl);
        return false;
      }

      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName
      );
      const blobClient = containerClient.getBlockBlobClient(blobName);

      const deleteResponse = await blobClient.deleteIfExists({
        deleteSnapshots: "include", // Delete snapshots if any
      });

      if (deleteResponse.succeeded) {
        console.log(`✅ File deleted successfully: ${blobName}`);
        return true;
      } else {
        console.warn(`⚠️ File not found for deletion: ${blobName}`);
        return false;
      }
    } catch (error) {
      console.error("❌ Failed to delete file:", error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * List files for a user with SAS URLs
   * @param {number} userId - User ID
   * @returns {Promise<Array>} List of user files
   */
  async listUserFiles(userId) {
    try {
      if (!this.isConfigured) {
        throw new Error("Azure Storage not configured");
      }

      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName
      );
      const prefix = `profile-${userId}-`;

      const files = [];
      for await (const blob of containerClient.listBlobsFlat({
        prefix,
        includeMetadata: true,
        includeTags: true,
      })) {
        const blobClient = containerClient.getBlockBlobClient(blob.name);
        let fileUrl = blobClient.url;

        // Generate SAS URL if credentials are available
        if (this.sharedKeyCredential) {
          try {
            fileUrl = await this.generateSasUrl(blobClient.url, 24);
          } catch (sasError) {
            console.warn(
              `⚠️ SAS generation failed for ${blob.name}:`,
              sasError.message
            );
          }
        }

        files.push({
          name: blob.name,
          url: fileUrl,
          size: blob.properties.contentLength,
          lastModified: blob.properties.lastModified,
          contentType: blob.properties.contentType,
          metadata: blob.metadata,
          tags: blob.tags,
          etag: blob.properties.etag,
        });
      }

      console.log(`📁 Found ${files.length} files for user ${userId}`);
      return files;
    } catch (error) {
      console.error("❌ Failed to list user files:", error);
      throw new Error(`Failed to list user files: ${error.message}`);
    }
  }

  /**
   * Get blob properties and metadata
   * @param {string} fileUrl - File URL
   * @returns {Promise<Object>} File properties
   */
  async getBlobProperties(fileUrl) {
    try {
      if (!this.isConfigured) {
        throw new Error("Azure Storage not configured");
      }

      const blobName = this._extractBlobNameFromUrl(fileUrl);
      if (!blobName) {
        throw new Error("Invalid file URL");
      }

      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName
      );
      const blobClient = containerClient.getBlockBlobClient(blobName);

      const properties = await blobClient.getProperties();

      return {
        size: properties.contentLength,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
        etag: properties.etag,
        metadata: properties.metadata,
        cacheControl: properties.cacheControl,
        contentDisposition: properties.contentDisposition,
      };
    } catch (error) {
      console.error("❌ Failed to get blob properties:", error);
      throw new Error(`Failed to get blob properties: ${error.message}`);
    }
  }

  // Private helper methods

  /**
   * Optimize image using Sharp
   * @private
   */
  async _optimizeImage(buffer, mimeType) {
    try {
      let sharpInstance = sharp(buffer);

      // Get image metadata
      const metadata = await sharpInstance.metadata();

      // console.log(
      //   `🖼️ Optimizing image: ${metadata.width}x${metadata.height}, ${metadata.format}`
      // );

      // Resize if too large (max 800x800 for profile pictures)
      if (metadata.width > 800 || metadata.height > 800) {
        sharpInstance = sharpInstance.resize(800, 800, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      // Convert to appropriate format and optimize
      let optimizedBuffer;
      if (mimeType === "image/png") {
        optimizedBuffer = await sharpInstance
          .png({ quality: 90, compressionLevel: 6, progressive: true })
          .toBuffer();
      } else if (mimeType === "image/webp") {
        optimizedBuffer = await sharpInstance
          .webp({ quality: 90, effort: 6 })
          .toBuffer();
      } else {
        // Default to JPEG for best compatibility
        optimizedBuffer = await sharpInstance
          .jpeg({ quality: 90, progressive: true, mozjpeg: true })
          .toBuffer();
      }

      const compressionRatio = (
        ((buffer.length - optimizedBuffer.length) / buffer.length) *
        100
      ).toFixed(1);
      // console.log(
      //   `✨ Image optimized: ${buffer.length} → ${optimizedBuffer.length} bytes (${compressionRatio}% reduction)`
      // );

      return optimizedBuffer;
    } catch (error) {
      console.error("⚠️ Image optimization failed, using original:", error);
      return buffer;
    }
  }

  /**
   * Extract blob name from Azure Storage URL
   * @private
   */
  _extractBlobNameFromUrl(url) {
    try {
      if (!url) return null;

      // Handle both full URLs and blob names
      if (url.includes("/")) {
        // Remove SAS token and extract blob name
        const urlWithoutSas = url.split("?")[0];
        const urlParts = urlWithoutSas.split("/");
        return urlParts[urlParts.length - 1];
      }

      return url;
    } catch (error) {
      console.error("Failed to extract blob name:", error);
      return null;
    }
  }

  /**
   * Check if container exists
   * @returns {Promise<boolean>}
   */
  async containerExists() {
    try {
      if (!this.isConfigured) return false;

      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName
      );
      return await containerClient.exists();
    } catch (error) {
      console.error("Failed to check container existence:", error);
      return false;
    }
  }

  /**
   * Get service status and diagnostics
   */
  getStatus() {
    return {
      isConfigured: this.isConfigured,
      containerName: this.containerName,
      accountName: this.accountName,
      hasSasCapability: !!this.sharedKeyCredential,
      serviceAvailable: this.blobServiceClient !== null,
    };
  }

  /**
   * Test Azure Storage connection
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      if (!this.isConfigured) {
        return {
          success: false,
          message: "Azure Storage not configured",
          details: this.getStatus(),
        };
      }

      // Test by checking service properties
      const serviceProperties = await this.blobServiceClient.getProperties();

      return {
        success: true,
        message: "Azure Storage connection successful",
        details: {
          accountKind:
            serviceProperties.storageServiceProperties?.defaultServiceVersion,
          containerExists: await this.containerExists(),
          ...this.getStatus(),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Azure Storage connection failed: ${error.message}`,
        details: this.getStatus(),
      };
    }
  }
}

// Create singleton instance
export const azureStorageService = new AzureStorageService();
