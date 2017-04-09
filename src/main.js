import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import { user , wdid , wikibase_default_site , wikidata_site } from './config.js'
import MainPage from './pages/MainPage.vue'
import QuestionPage from './pages/QuestionPage.vue'
import QuizPage from './pages/QuizPage.vue'
import DesignQuiz from './pages/DesignQuiz.vue'
import NewQuestions from './pages/NewQuestions.vue'
import ImportMoodleXML from './pages/ImportMoodleXML.vue'
import ItemList from './pages/ItemList.vue'
import WikibaseItem from './mixins/WikibaseItem.js'
import i18n from './components/i18n.vue'
import NavHeader from './components/nav-header.vue'

Vue.use(VueRouter);
Vue.use(NavHeader);

const routes = [
  { path: '/', component: MainPage },
  { path: '/main', component: MainPage },
  { path: '/question/:q', component: QuestionPage , props:true } ,
  { path: '/quiz/:q', component: QuizPage , props:true } ,
  { path: '/new/questions', component: NewQuestions } ,
  { path: '/import/moodle_xml', component: ImportMoodleXML } ,
  { path: '/design/quiz', component: DesignQuiz } ,
  { path: '/design/quiz/:q', component: DesignQuiz , props:true } ,
  { path: '/items/:q', component: ItemList , props:true } ,
] ;

var router ;
var app ;


$(document).ready ( function () {

	var cnt = 2 ;
	function fin () {
		if ( --cnt > 0 ) return ;
		router = new VueRouter({routes}) ;
		app = new Vue ( { router } ) .$mount('#app') ;
	}
	
	
	function loadI18n () {
		var i = new Vue ( { mixins : [ i18n ] } ) ;
		i.loadTranslations ( fin ) ;
	}
	
	user.loadUserInfo(fin) ;
	loadI18n() ;
	
} ) ;
