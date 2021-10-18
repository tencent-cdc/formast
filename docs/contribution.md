# 参与贡献

我们欢迎社区中所有同学参与贡献，无论是发现了某些代码层面的 bug，还是文档中的错别字，抑或功能上的缺陷，都可以向我们提 PR。如果你希望 Formast 在功能上进行扩展，或想到一些不错的想法，也可以在社区中向我们提出，一起探讨。

## 如何提交PR

Github 有一套通用的PR流程，你可以按照如下步骤向我们提 PR。

1. 进入 formast 项目页面：https://github.com/tencent-cdc/formast
2. 点击右上角的 fork 按钮，并选择目标账户，一般是你的个人账户，完成 fork
3. 进入自己的 github 主页，找到刚才 fork 的项目，将该项目 clone 到自己的电脑上
4. 在自己的电脑上修改代码，完成修改后 push 到自己的项目中
5. 再次进入自己 fork 的项目，找到 pull request 按钮，大多数情况下，如果你 push 了新代码，你一进入项目就可以看到一个大大的绿色按钮，可以看到 pull request 字样，点击它
6. 在接下来的界面中，选择你刚才修改的代码所在的分支，向 tecent-cdc/formast 的 develop 分支提交 pull request
7. 进入该 pull request 的详情页，等待我们在该页面的回复，我们会根据情况告诉你你提交的代码可能存在某些不足，需要改进，你改进之后符合我们的要求，我们就会主动把你的代码合并到我们的分支上

## 提交规范

1. commit 信息需遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/) 规范，不遵循该规范将无法合并到主分支中
2. 代码风格遵循腾讯 eslint、stylelint 规范配置
3. PR 名称格式：`<type>`(`<scope>`): `<subject>` 举例：feat(core): add unit test
4. PR 内容：列举本次改动的内容
5. PR 要求：增加的 feat 内容，尽量做到注释清晰，相应的单测覆盖要尽可能覆盖
6. BUGFIX 要求：如果修改的问题和 issues 相关，请在内容中附上相关的 issueID。

## 本地开发

使用 vscode 进行开发，安装 ESLint、Prettier ESLint 扩展。

```
npm i
npm run dev:react
```

具体的本地服务命令可阅读 package.json 文件。