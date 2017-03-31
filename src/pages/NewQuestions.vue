<template>
<div>
<nav-header></nav-header>
<enter-questions :questions="questions"></enter-questions>
</div>
</template>

<script>
import EnterQuestions from '../components/edit_questions/enter-questions.vue'
import NavHeader from '../components/nav-header.vue'

export default {
	components : { 'enter-questions':EnterQuestions , 'nav-header':NavHeader } ,
	data : function () { return { questions:[] } } ,
}
</script>

<style>
</style>
