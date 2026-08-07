import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Badge, Button, Empty, List, Popover, Tooltip } from "antd";
import dayjs from "dayjs";
import { type ReactNode, useMemo, useState } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import type { NotificationType } from "@/types";

const typeIcon: Record<NotificationType, ReactNode> = {
  info: <InfoCircleOutlined />,
  success: <CheckCircleOutlined />,
  warning: <WarningOutlined />,
  error: <CloseCircleOutlined />,
};

/** 消息中心：未读角标 + 弹层列表，支持单条/全部已读与清空 */
export default function NotificationBell() {
  const items = useNotificationStore((state) => state.items);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const clear = useNotificationStore((state) => state.clear);
  const [open, setOpen] = useState(false);
  const unread = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const content = (
    <div className="notification-panel">
      <List
        dataSource={items}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无通知" />,
        }}
        renderItem={(item) => (
          <List.Item
            className={item.read ? "read" : ""}
            actions={
              item.read
                ? undefined
                : [
                    <Button key="read" type="link" size="small" onClick={() => markRead(item.id)}>
                      已读
                    </Button>,
                  ]
            }
          >
            <List.Item.Meta
              avatar={
                <span className={`notify-icon notify-${item.type}`}>{typeIcon[item.type]}</span>
              }
              title={item.title}
              description={
                <div>
                  <div>{item.content}</div>
                  <div className="notify-time">{dayjs(item.createdAt).fromNow()}</div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      <div className="notification-actions">
        <Button type="text" size="small" disabled={unread === 0} onClick={markAllRead}>
          全部已读
        </Button>
        <Button type="text" size="small" danger disabled={items.length === 0} onClick={clear}>
          清空
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={false}
      styles={{ content: { padding: 0 } }}
    >
      <Tooltip title="消息中心">
        <Badge count={unread} size="small" offset={[-2, 2]}>
          <Button type="text" aria-label="消息中心" icon={<BellOutlined />} />
        </Badge>
      </Tooltip>
    </Popover>
  );
}
