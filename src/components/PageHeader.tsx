import type { ReactNode } from "react";

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  description?: string;
  extra?: ReactNode;
}

/** 页面头部：渐变图标 + 标题 + 描述 + 操作区 */
export default function PageHeader({ icon, title, description, extra }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <span className="page-header-icon">{icon}</span>
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
      </div>
      {extra ? <div>{extra}</div> : null}
    </div>
  );
}
