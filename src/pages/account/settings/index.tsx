import { CheckOutlined, IdcardOutlined, UserOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Radio,
  Switch,
  Tabs,
  Upload,
  type UploadProps,
} from "antd";
import { useState } from "react";
import { changePasswordApi, updateProfileApi } from "@/api/auth";
import PageHeader from "@/components/PageHeader";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { Gender, UserInfo } from "@/types";
import { notify } from "@/utils/notify";

type ProfileValues = Pick<UserInfo, "nickname" | "email" | "phone" | "gender" | "dept">;

function ProfileTab() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [form] = Form.useForm<ProfileValues>();
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      notify.error("仅支持上传图片文件");
      return false;
    }
    if (file.size > 1024 * 1024) {
      notify.error("图片大小不能超过 1MB");
      return false;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfileApi({ username: user.username, avatar: String(reader.result) })
        .then((updated) => {
          setUser(updated);
          notify.success("头像已更新");
        })
        .catch(() => undefined);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const onFinish = async (values: ProfileValues) => {
    setSaving(true);
    try {
      const updated = await updateProfileApi({ username: user.username, ...values });
      setUser(updated);
    } catch {
      // 错误提示已处理
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <div className="avatar-uploader">
        <Avatar size={72} src={user.avatar} icon={<UserOutlined />} />
        <Upload showUploadList={false} beforeUpload={beforeUpload} accept="image/*">
          <Button>更换头像</Button>
        </Upload>
        <span className="stat-desc">支持 JPG / PNG，不超过 1MB</span>
      </div>
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
        initialValues={user}
      >
        <Form.Item label="用户名">
          <Input value={user.username} disabled />
        </Form.Item>
        <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: "请输入昵称" }]}>
          <Input placeholder="请输入昵称" />
        </Form.Item>
        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: "请输入邮箱" },
            { type: "email", message: "邮箱格式不正确" },
          ]}
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="手机号"
          rules={[{ pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确" }]}
        >
          <Input placeholder="请输入手机号" maxLength={11} />
        </Form.Item>
        <Form.Item name="gender" label="性别">
          <Radio.Group
            options={[
              { label: "男", value: 1 as Gender },
              { label: "女", value: 2 as Gender },
              { label: "未知", value: 0 as Gender },
            ]}
          />
        </Form.Item>
        <Form.Item name="dept" label="部门">
          <Input placeholder="请输入部门" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            保存修改
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

interface PasswordValues {
  oldPassword: string;
  newPassword: string;
  confirm: string;
}

function SecurityTab() {
  const user = useAuthStore((state) => state.user);
  const [form] = Form.useForm<PasswordValues>();
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const onFinish = async (values: PasswordValues) => {
    setSaving(true);
    try {
      await changePasswordApi({
        username: user.username,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      form.resetFields();
    } catch {
      // 错误提示已处理
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      autoComplete="off"
      onFinish={onFinish}
      style={{ maxWidth: 480 }}
    >
      <Form.Item
        name="oldPassword"
        label="原密码"
        rules={[{ required: true, message: "请输入原密码" }]}
      >
        <Input.Password placeholder="请输入原密码" />
      </Form.Item>
      <Form.Item
        name="newPassword"
        label="新密码"
        rules={[
          { required: true, message: "请输入新密码" },
          { min: 6, max: 20, message: "密码长度为 6-20 位" },
        ]}
      >
        <Input.Password placeholder="6-20 位新密码" />
      </Form.Item>
      <Form.Item
        name="confirm"
        label="确认新密码"
        dependencies={["newPassword"]}
        rules={[
          { required: true, message: "请再次输入新密码" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
              return Promise.reject(new Error("两次输入的密码不一致"));
            },
          }),
        ]}
      >
        <Input.Password placeholder="再次输入新密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>
          更新密码
        </Button>
      </Form.Item>
    </Form>
  );
}

const presetColors = ["#165dff", "#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

function PreferenceTab() {
  const themeMode = useAppStore((state) => state.themeMode);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const watermark = useAppStore((state) => state.watermark);
  const setWatermark = useAppStore((state) => state.setWatermark);
  const primaryColor = useAppStore((state) => state.primaryColor);
  const setPrimaryColor = useAppStore((state) => state.setPrimaryColor);

  return (
    <div style={{ maxWidth: 520 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 0",
          borderBottom: "1px solid rgba(128,128,128,.15)",
        }}
      >
        <div>
          <div style={{ fontWeight: 500 }}>主题色</div>
          <div className="stat-desc" style={{ fontSize: 13 }}>
            自定义全站品牌色，设置会自动持久化
          </div>
        </div>
        <div className="color-swatches">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`主题色 ${color}`}
              className={`color-swatch${color === primaryColor ? " active" : ""}`}
              style={{ background: color }}
              onClick={() => setPrimaryColor(color)}
            >
              {color === primaryColor ? <CheckOutlined /> : null}
            </button>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 0",
          borderBottom: "1px solid rgba(128,128,128,.15)",
        }}
      >
        <div>
          <div style={{ fontWeight: 500 }}>暗黑模式</div>
          <div className="stat-desc" style={{ fontSize: 13 }}>
            切换全站明暗主题，设置会自动持久化
          </div>
        </div>
        <Switch
          checked={themeMode === "dark"}
          onChange={(checked) => setThemeMode(checked ? "dark" : "light")}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
        <div>
          <div style={{ fontWeight: 500 }}>页面水印</div>
          <div className="stat-desc" style={{ fontSize: 13 }}>
            在内容区域显示当前用户水印，用于安全审计
          </div>
        </div>
        <Switch checked={watermark} onChange={setWatermark} />
      </div>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <div>
      <PageHeader
        icon={<IdcardOutlined />}
        title="个人设置"
        description="管理个人资料、账号安全与界面偏好"
      />
      <Card>
        <Tabs
          items={[
            { key: "profile", label: "基本资料", children: <ProfileTab /> },
            { key: "security", label: "安全设置", children: <SecurityTab /> },
            { key: "preference", label: "偏好设置", children: <PreferenceTab /> },
          ]}
        />
      </Card>
    </div>
  );
}
