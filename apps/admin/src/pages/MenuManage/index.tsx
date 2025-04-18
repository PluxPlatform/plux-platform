import React, { useState } from "react";
import { Tree, Form, Input, Button, Space, Modal, message, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

type MenuItem = {
  key: string;
  title: string;
  children?: MenuItem[];
};

const initialMenus: MenuItem[] = [
  { key: "1", title: "首页" },
  {
    key: "2",
    title: "系统管理",
    children: [{ key: "2-1", title: "用户管理" }],
  },
];

const MenuManage: React.FC = () => {
  const [menus, setMenus] = useState<MenuItem[]>(initialMenus);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [form] = Form.useForm();

  const handleSelect = (keys: React.Key[]) => {
    setSelectedKey(keys[0] as string);
    const findMenu = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.key === keys[0]) return item;
        if (item.children) {
          const found = findMenu(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    setEditingMenu(findMenu(menus));
    form.setFieldsValue(findMenu(menus) || {});
  };

  const handleAdd = () => {
    setEditingMenu(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = () => {
    setModalOpen(true);
  };

  const handleDelete = () => {
    const deleteMenu = (items: MenuItem[]): MenuItem[] =>
      items
        .filter((item) => item.key !== selectedKey)
        .map((item) => ({
          ...item,
          children: item.children ? deleteMenu(item.children) : undefined,
        }));
    setMenus(deleteMenu(menus));
    setSelectedKey(null);
    setEditingMenu(null);
    message.success("删除成功");
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingMenu) {
        // 编辑
        const updateMenu = (items: MenuItem[]): MenuItem[] =>
          items.map((item) =>
            item.key === editingMenu.key
              ? { ...item, ...values }
              : {
                  ...item,
                  children: item.children
                    ? updateMenu(item.children)
                    : undefined,
                }
          );
        setMenus(updateMenu(menus));
        message.success("编辑成功");
      } else {
        // 新增
        setMenus([...menus, { ...values, key: Date.now().toString() }]);
        message.success("新增成功");
      }
      setModalOpen(false);
    });
  };

  return (
    <div className="flex gap-8">
      <Card title="菜单树">
        <Space>
          <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
            新增
          </Button>
          <Button
            icon={<EditOutlined />}
            disabled={!selectedKey}
            onClick={handleEdit}
          >
            编辑
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            disabled={!selectedKey}
            onClick={handleDelete}
          >
            删除
          </Button>
        </Space>
        <Tree
          treeData={menus}
          selectedKeys={selectedKey ? [selectedKey] : []}
          onSelect={handleSelect}
          fieldNames={{ title: "title", key: "key", children: "children" }}
        />
      </Card>
      <Card title="菜单详情" style={{ flex: 1 }}>
        <Form form={form} layout="vertical" initialValues={editingMenu || {}}>
          <Form.Item
            name="title"
            label="菜单名称"
            rules={[{ required: true, message: "请输入菜单名称" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Card>
      <Modal
        title={editingMenu ? "编辑菜单" : "新增菜单"}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={editingMenu || {}}>
          <Form.Item
            name="title"
            label="菜单名称"
            rules={[{ required: true, message: "请输入菜单名称" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManage;
