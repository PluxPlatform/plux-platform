import React from "react";
import { Layout, Menu } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "user", label: "人员管理" },
  { key: "menu", label: "菜单管理" },
];

const BasicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname.split("/")[1] || "user";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="m-[16px] text-[#fff] p-[16px] bg-[rgba(255,255,255,.2)] text-[14px]">
          PluxPlatform
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(`/${key}`)}
        />
      </Sider>
      <Layout>
        <Header className="flex justify-end items-center p-[24px] bg-[#fff]">
          <span>欢迎您，管理员</span>
        </Header>

        <Content className="m-[24px] mh-[200px]  p-[10px] bg-[#fff]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
