export default {
	userinfo : {} ,
	isLoggedIn : function () { return this.userinfo.id > 0 } ,
	getUserName : function () { return this.userinfo.name } ,
}