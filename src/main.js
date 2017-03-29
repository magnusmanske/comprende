import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import meta from './config/meta.js'
import MainPage from './pages/MainPage.vue'
import QuestionPage from './pages/QuestionPage.vue'
import QuizPage from './pages/QuizPage.vue'
import NewQuestions from './pages/NewQuestions.vue'
import ImportMoodleXML from './pages/ImportMoodleXML.vue'

Vue.use(VueRouter);

const routes = [
  { path: '/', component: MainPage },
  { path: '/main', component: MainPage },
  { path: '/question/:q', component: QuestionPage , props:true } ,
  { path: '/quiz/:q', component: QuizPage , props:true } ,
  { path: '/new/questions', component: NewQuestions } ,
  { path: '/import/moodle_xml', component: ImportMoodleXML } ,
] ;

var router ;
var app ;


$(document).ready ( function () {

	var cnt = 1 ;
	function fin () {
		if ( --cnt > 0 ) return ;
		router = new VueRouter({routes}) ;
		app = new Vue ( { router } ) .$mount('#app') ;
	}
	
	$.get ( './api.php' , {
		action:'query',
		meta:'userinfo',
		format:'json'
	} , function ( d ) {
		meta.userinfo = d.query.userinfo ;
	} , 'json' ) . always ( fin ) ;
} ) ;
