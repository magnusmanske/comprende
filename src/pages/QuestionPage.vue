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

export default {
	mixins : [ wikibaseAPImixin ] ,
	props : [ 'q' ] ,
	components : { question:question , 'nav-header':NavHeader } ,
	data : function () { return { type:'' , loading:true } } ,
}
</script>

<style>
</style>