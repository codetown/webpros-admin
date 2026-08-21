import type { TableColumnsType } from "antd";
import { Badge, Descriptions, Drawer, Space, Table, Tag } from "antd";
import type { Workflow, WorkflowField, WorkflowFieldType } from "@/types";
import { fieldTypeLabels } from "../components/fields";

interface PreviewDrawerProps {
  workflow: Workflow | null;
  onClose: () => void;
}

/** 流程预览抽屉：只读展示流程的步骤与表单项结构 */
export default function PreviewDrawer({ workflow, onClose }: PreviewDrawerProps) {
  const columns: TableColumnsType<WorkflowField> = [
    { title: "字段名称", dataIndex: "label", width: 140 },
    {
      title: "类型",
      dataIndex: "type",
      width: 90,
      render: (type: WorkflowFieldType) => <Tag color="processing">{fieldTypeLabels[type]}</Tag>,
    },
    {
      title: "必填",
      dataIndex: "required",
      width: 60,
      render: (required: boolean) => (required ? "是" : "否"),
    },
    {
      title: "默认值",
      dataIndex: "defaultValue",
      render: (value: unknown) => {
        if (value === undefined || value === null || value === "") return "-";
        return Array.isArray(value) ? value.join("、") : String(value);
      },
    },
  ];

  return (
    <Drawer
      title={`流程预览 - ${workflow?.name ?? ""}`}
      width={680}
      open={Boolean(workflow)}
      onClose={onClose}
      destroyOnHidden
    >
      {workflow ? (
        <div>
          <Descriptions
            column={2}
            size="small"
            bordered
            style={{ marginBottom: 20 }}
            items={[
              { key: "name", label: "流程名称", children: workflow.name },
              { key: "code", label: "流程编码", children: <Tag>{workflow.code}</Tag> },
              {
                key: "status",
                label: "状态",
                children: (
                  <Badge
                    status={workflow.status === 1 ? "success" : "error"}
                    text={workflow.status === 1 ? "启用" : "停用"}
                  />
                ),
              },
              {
                key: "count",
                label: "步骤 / 字段",
                children: `${workflow.steps.length} 步 / ${workflow.steps.reduce(
                  (sum, step) => sum + step.fields.length,
                  0,
                )} 个表单项`,
              },
              ...(workflow.description
                ? [{ key: "desc", label: "描述", span: 2 as const, children: workflow.description }]
                : []),
            ]}
          />

          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {workflow.steps.map((step, index) => (
              <div key={step.id} className="workflow-step-card">
                <div className="workflow-step-head">
                  <div>
                    <span className="workflow-step-index">{index + 1}</span>
                    <span className="workflow-step-name">{step.name}</span>
                    {step.description ? (
                      <span className="stat-desc" style={{ marginLeft: 8, fontSize: 12 }}>
                        {step.description}
                      </span>
                    ) : null}
                  </div>
                </div>
                <Table<WorkflowField>
                  rowKey="id"
                  size="small"
                  columns={columns}
                  dataSource={step.fields}
                  pagination={false}
                  locale={{ emptyText: "该步骤暂无表单项" }}
                />
              </div>
            ))}
          </Space>
        </div>
      ) : null}
    </Drawer>
  );
}
