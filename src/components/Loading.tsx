import { Spin } from "antd";

export default function Loading() {
  return (
    <div className="page-loading">
      <Spin size="large" />
    </div>
  );
}
