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
	data : function () { return { type:'' , loading:true } } ,
	created : function () {
		question_bus.$on ( 'answered' , this.wasAnswered ) ;
	} ,
	methods : {
		wasAnswered : function ( success , fraction ) {
			console.log ( success , fraction ) ;
		} ,
	} ,
}
</script>

<style>
</style>