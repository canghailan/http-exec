# exec() by http


## 启动
```javascript
require('http-exec').server();
```

## 示例
```http
GET http://localhost:3000/<命令>?<命令参数>
Authorization: Bearer <TOKEN>

<标准输入>

---
<标准输出>
<标准错误>
```
* 命令名，通过URL path指定
* 命令参数，通过URL query传入
* 标准输入，需要使用POST方法，通过请求body传入
* 标准输出、标准错误，通过响应body返回
* 如果启用了Token鉴权，通过Authorization请求头传入

Shell命令
```shell
git --help
```

对应HTTP接口
```http
GET http://localhost:3000/git?--help
```


## 环境变量支持
* PORT  服务器监听端口，默认3000
* TOKEN  静态Token鉴权配置，可配置多个，使用逗号分隔，默认不启用（无鉴权）
* COMMAND  命令白名单，可配置多个，使用逗号分隔，默认不启用（可执行任意命令）
* PATH  指定命令查找路径，默认使用系统PATH
* CHARSET  指定响应字符编码，默认无，Windows下中文乱码可指定为gbk


## License
MIT
