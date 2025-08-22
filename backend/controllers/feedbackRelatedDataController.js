import {
  Category,
  Channel,
  Provider,
  Programme,
  Project,
  Activity,
  Community,
} from "../models/FeedbackRelatedData.js";

export const feedbackRelatedDataController = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.getAll();
      if (!categories || categories.length === 0) {
        return res.status(404).json({ error: "No categories found" });
      }
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res
        .status(500)
        .json({ error: "Internal server error: " + error.message });
    }
  },

  getChannels: async (req, res) => {
    try {
      const channels = await Channel.getAll();
      if (!channels || channels.length === 0) {
        return res.status(404).json({ error: "No channels found" });
      }
      res.json(channels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      res
        .status(500)
        .json({ error: "Internal server error: " + error.message });
    }
  },

  getProviders: async (req, res) => {
    try {
      const providers = await Provider.getAll();
      if (!providers || providers.length === 0) {
        return res.status(404).json({ error: "No providers found" });
      }
      res.json(providers);
    } catch (error) {
      console.error("Error fetching providers:", error);
      res
        .status(500)
        .json({ error: "Internal server error: " + error.message });
    }
  },

  getProgrammes: async (req, res) => {
    try {
      const programmes = await Programme.getAll();
      res.json(programmes);
    } catch (error) {
      console.error("Error fetching programmes:", error);
      res
        .status(500)
        .json({ error: "Internal server error: " + error.message });
    }
  },

  getProjects: async (req, res) => {
    try {
      const projects = await Project.getAll();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res
        .status(500)
        .json({ error: "Internal server error: " + error.message });
    }
  },

  getActivities: async (req, res) => {
    try {
      const activities = await Activity.getAll();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res
        .status(500)
        .json({ error: "Internal server error: " + error.message });
    }
  },

  getCommunities: async (req, res) => {
    try {
      const communities = await Community.getAll();
      res.json(communities);
    } catch (error) {
      console.error("Error fetching communities:", error);
      res
        .status(500)
        .json({ error: "Internal server error: " + error.message });
    }
  },
};
