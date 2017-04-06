<template>
<div>
<nav-header></nav-header>
<question :q='q' auto_show_choices='1'></question>
</div>
</template>


<script>
import question from '../components/show_questions/question.vue'
import wikibaseAPImixin from '../mixins/wikibaseAPImixin.js'
import NavHeader from '../components/nav-header.vue'
import question_bus from '../components/show_questions/question_bus.vue'

export default {
	mixins : [ wikibaseAPImixin ] ,
	props : [ 'q' ] ,
	components : { question:question , 'nav-header':NavHeader } ,
	data : function () { return {} } ,
	created : function () {
		question_bus.$on ( 'answered' , this.wasAnswered ) ;
		this.init() ;
	} ,
	methods : {
		init : function () {
			var me = this ;
			me.loading = true ;
			me.loadItems ( [me.q] , function () {
				var i = me.getItem ( me.q ) ;
			} ) ;
		} ,
		wasAnswered : function ( success , fraction ) {
			console.log ( success , fraction ) ;
		} ,
	} ,
	watch : {
		'$route' (n,o) { this.init() } ,
	} ,
}
</script>

<style>
</style>