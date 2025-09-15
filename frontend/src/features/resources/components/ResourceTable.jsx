import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";

import Text from "../../../ui/Text";
import IconButton from "../../../ui/IconButton";
import StatusBadge from "../../../ui/StatusBadge";
import { formatDate } from "../../../utils/dateUtils";
// import { getColorStyles } from "../../../utils/caseUtils";

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
`;

const TableHeader = styled.thead`
  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-200);
  position: sticky;
  top: 0;
  z-index: 1;
`;

const TableHeaderCell = styled.th`
  padding: var(--spacing-3) var(--spacing-4);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-700);
  font-size: var(--font-size-xs);
  white-space: nowrap;

  &:last-child {
    text-align: center;
    width: 8rem;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--color-grey-100);
  transition: background-color var(--duration-fast) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-25);
  }

  &:last-child {
    border-bottom: none;
  }

  ${(props) =>
    props.$isInactive &&
    `
    opacity: 0.6;
    background-color: var(--color-grey-25);
  `}
`;

const TableCell = styled.td`
  padding: var(--spacing-3) var(--spacing-4);
  vertical-align: middle;
  text-align: left;
`;

const ActionsCell = styled(TableCell)`
  text-align: center;
  width: 8rem;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
`;

const ColorSwatch = styled.div`
  width: 1.6rem;
  height: 1.6rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid ${(props) => `var(${props.$color})`};
  background-color: ${(props) => `var(${props.$color})`};
  display: inline-block;
`;

const SortOrderBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: var(--color-brand-100);
  color: var(--color-brand-700);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
`;

/**
 * ResourceTable Component
 *
 * A reusable table component for displaying resource data
 * with edit, delete, and toggle active functionality
 */
function ResourceTable({
  data = [],
  resourceKey,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  // Get column configuration based on resource type
  const getColumns = () => {
    const baseColumns = [
      {
        key: "name",
        label: "Name",
        render: (item) => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-1)",
            }}
          >
            <Text size="sm" weight="semibold">
              {item.name}
            </Text>
            {item.arabicName && (
              <Text size="xs" color="muted">
                {item.arabicName}
              </Text>
            )}
          </div>
        ),
      },
    ];

    // Add resource-specific columns
    switch (resourceKey) {
      case "categories":
      case "statuses":
        return [
          ...baseColumns,
          {
            key: "color",
            label: "Color",
            render: (item) => (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-2)",
                }}
              >
                <ColorSwatch $color={item.color || "--color-grey-200"} />
                <Text
                  size="xs"
                  color="muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {item?.color?.split("-")[3] || "Default"}
                </Text>
              </div>
            ),
          },
          {
            key: "sortOrder",
            label: "Order",
            render: (item) => (
              <SortOrderBadge>{item.sortOrder || 0}</SortOrderBadge>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <StatusBadge
                content={item.isActive ? "Active" : "Inactive"}
                variant={item.isActive ? "success" : "secondary"}
                size="sm"
              />
            ),
          },
        ];

      case "priorities":
        return [
          ...baseColumns,
          {
            key: "level",
            label: "Level",
            render: (item) => (
              <Text size="sm" weight="semibold">
                {item.level}
              </Text>
            ),
          },
          {
            key: "color",
            label: "Color",
            render: (item) => (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-2)",
                }}
              >
                <ColorSwatch $color={item.color || "--color-grey-200"} />
              </div>
            ),
          },
          {
            key: "responseTime",
            label: "Response Time",
            render: (item) => (
              <Text size="sm">
                {item.responseTimeHours ? `${item.responseTimeHours}h` : "-"}
              </Text>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <StatusBadge
                content={item.isActive ? "Active" : "Inactive"}
                variant={item.isActive ? "success" : "secondary"}
                size="sm"
              />
            ),
          },
        ];

      case "regions":
        return [
          ...baseColumns,
          {
            key: "code",
            label: "Code",
            render: (item) => (
              <Text size="sm" style={{ fontFamily: "var(--font-mono)" }}>
                {item.code}
              </Text>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <StatusBadge
                content={item.isActive ? "Active" : "Inactive"}
                variant={item.isActive ? "success" : "secondary"}
                size="sm"
              />
            ),
          },
        ];

      case "governorates":
      case "communities":
        return [
          ...baseColumns,
          {
            key: "code",
            label: "Code",
            render: (item) => (
              <Text size="sm" style={{ fontFamily: "var(--font-mono)" }}>
                {item.code || "-"}
              </Text>
            ),
          },
          {
            key: "parent",
            label: resourceKey === "governorates" ? "Region" : "Governorate",
            render: (item) => (
              <Text size="sm">
                {resourceKey === "governorates"
                  ? item.region?.name || "-"
                  : item.governorate?.name || "-"}
              </Text>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <StatusBadge
                content={item.isActive ? "Active" : "Inactive"}
                variant={item.isActive ? "success" : "secondary"}
                size="sm"
              />
            ),
          },
        ];

      case "programs":
      case "projects":
      case "activities":
        return [
          ...baseColumns,
          {
            key: "code",
            label: "Code",
            render: (item) => (
              <Text size="sm" style={{ fontFamily: "var(--font-mono)" }}>
                {item.code}
              </Text>
            ),
          },
          {
            key: "dates",
            label: "Period",
            render: (item) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-1)",
                }}
              >
                {item.startDate && (
                  <Text size="xs">Start: {formatDate(item.startDate)}</Text>
                )}
                {item.endDate && (
                  <Text size="xs">End: {formatDate(item.endDate)}</Text>
                )}
                {!item.startDate && !item.endDate && (
                  <Text size="xs" color="muted">
                    -
                  </Text>
                )}
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <StatusBadge
                content={item.isActive ? "Active" : "Inactive"}
                variant={item.isActive ? "success" : "secondary"}
                size="sm"
              />
            ),
          },
        ];

      default:
        return [
          ...baseColumns,
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <StatusBadge
                content={item.isActive ? "Active" : "Inactive"}
                variant={item.isActive ? "success" : "secondary"}
                size="sm"
              />
            ),
          },
        ];
    }
  };

  const columns = getColumns();

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHeaderCell key={column.key}>{column.label}</TableHeaderCell>
          ))}
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id} $isInactive={item.isActive === false}>
            {columns.map((column) => (
              <TableCell key={column.key}>
                {column.render ? column.render(item) : item[column.key]}
              </TableCell>
            ))}
            <ActionsCell>
              <ActionButtons>
                <IconButton
                  variant="ghost"
                  size="small"
                  onClick={() => onEdit?.(item)}
                  aria-label="Edit"
                >
                  <HiOutlinePencil />
                </IconButton>

                <IconButton
                  variant="ghost"
                  size="small"
                  onClick={() => onToggleActive?.(item)}
                  aria-label={item.isActive ? "Deactivate" : "Activate"}
                >
                  {item.isActive ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                </IconButton>

                <IconButton
                  variant="ghost"
                  size="small"
                  onClick={() => onDelete?.(item)}
                  aria-label="Delete"
                >
                  <HiOutlineTrash />
                </IconButton>
              </ActionButtons>
            </ActionsCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

ResourceTable.propTypes = {
  data: PropTypes.array,
  resourceKey: PropTypes.string.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleActive: PropTypes.func,
};

export default ResourceTable;
