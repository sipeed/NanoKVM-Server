# NanoKVM Server

NanoKVM WEB 项目。

## 项目结构

```bash
.
├── backend                         # 后端项目
│         ├── auth                  # 鉴权 api
│         ├── codes                 # 键盘代码定义
│         ├── events                # 键盘和鼠标 api
│         ├── log.go                # 日志
│         ├── protocol              # req 和 rsp 定义
│         ├── router.go             # 路由
│         └── vm                    # NanoKVM 相关 api
├── frontend                        # 前端项目
│         └── src
│             ├── app               # 前端页面
│             ├── assets            # 资源文件
│             ├── components        # 公共组件
│             ├── i18n              # 多语言
│             ├── lib               # 公共函数
│             └── types             # 类型定义 
└── main.go                         # 项目启动文件

```

## 运行

该项目包含前端和后端代码，需要分别编译。

```bash
# 编译 golang
go mod tidy
GOARCH=riscv64 GOOS=linux go build
```

```bash
# 编译 react
cd frontend
pnpm install
pnpm build
```

将编译后的前端文件重命名为 web：`mv frontend/dist web`；与编译的 go 可执行文件放到同一目录下；然后运行：`./NanoKVM-Server`。
