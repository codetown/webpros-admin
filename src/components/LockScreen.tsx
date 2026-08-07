import { LockOutlined, LogoutOutlined, UnlockOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Input } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { unlockApi } from "@/api/auth";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { notify } from "@/utils/notify";

/** 锁屏遮罩：显示实时时钟，输入登录密码解锁 */
export default function LockScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const unlock = useAppStore((state) => state.unlock);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => dayjs());

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlock = async () => {
    if (!user) return;
    if (!password) {
      notify.warning("请输入解锁密码");
      return;
    }
    setLoading(true);
    try {
      await unlockApi({ username: user.username, password });
      setPassword("");
      unlock();
      notify.success("欢迎回来");
    } catch {
      // 错误提示已由请求层处理
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    unlock();
    logout();
  };

  return (
    <div className="lock-screen">
      <div className="lock-clock">{now.format("HH:mm:ss")}</div>
      <div className="lock-date">{now.format("YYYY年M月D日 dddd")}</div>
      <div className="lock-panel">
        <Avatar size={64} src={user?.avatar} icon={<UserOutlined />} />
        <div className="lock-name">{user?.nickname ?? "-"}</div>
        <Input.Password
          size="large"
          autoFocus
          prefix={<LockOutlined />}
          placeholder="请输入密码解锁"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onPressEnter={handleUnlock}
          style={{ width: 280 }}
        />
        <Button
          size="large"
          type="primary"
          block
          icon={<UnlockOutlined />}
          loading={loading}
          onClick={handleUnlock}
          style={{ width: 280 }}
        >
          解锁
        </Button>
        <Button type="link" icon={<LogoutOutlined />} onClick={handleLogout}>
          退出登录
        </Button>
      </div>
    </div>
  );
}
