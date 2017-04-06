<template id='MainPage'>
<div>
<nav-header></nav-header>
<ul>
<li><router-link to='/question/Q5'><i18n k='example_question'/></router-link></li>
<li>Play <router-link to='/quiz/Q70'><i18n k='example_quiz'/></router-link>, or the biological <router-link to='/quiz/Q80'><i18n k='example_quiz'/></router-link></li>
<li><router-link to='/design/quiz/Q70'><i18n k='design example quiz'/></router-link> or <router-link to='/design/quiz'><i18n k='create new quiz'/></router-link></li>
<li><router-link to='/new/questions'><i18n k='create new questions'/></router-link> (<i18n k='with or without quiz'/>)</li>
<li><i18n k='import questions from other formats'></i18n>
	<ul>
	<li><router-link to='/import/moodle_xml'><i18n k='moodle xml'/></router-link></li>
	</ul>
</li>
<li><a href='/comprende/'><i18n k='the wikibase instance'/></a></li>
</ul>
</div>
</template>

<script>
import i18n from '../components/i18n.vue'
import NavHeader from '../components/nav-header.vue'

export default {
	name: 'MainPage',
	components: { i18n , 'nav-header':NavHeader } ,
} ;
</script>

<style>
</style>