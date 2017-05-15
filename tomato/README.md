## koa2 + Vue2.0

### 目录说明
---
├─app                                                                                                                                                                                                                                                                                                              
│  ├─controller                                                                                                                                                                                                                                                                                                   
│  ├─routes                                                                                                                                                                                                                                                                                                       
│  └─util                                                                                                                                                                                                                                                                                                         
├─bin                                                                                                                                                                                                                                                                                                              
├─config                                                                                                                                                                                                                                                                                                           
│  ├─build                                                                                                                                                                                                                                                                                                        
│  └─env                                                                                                                                                                                                                                                                                                          
├─dist                                                                                                                                                                                                                                                                                                             
├─logs                                                                                                                                                                                                                                                                                                             
├─test                                                                                                                                                                                                                                                                                                             
└─views 

---

### 目标
1. Vue2作为视图层，Koa2作为控制层
2. 支持mongo，支持REST
3. webpack2完成打包、即时编译
4. 支持https
5. 必须编写测试用例，方便代码重构、代码覆盖测试
6. js语法检查
7. 多页面和单页面混用支持
8. 支持第三方登录，微博、微信
9. 支持CSP，XSS过滤
