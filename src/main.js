import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import meta from './config/meta.js'
import MainPage from './pages/MainPage.vue'
import QuestionPage from './pages/QuestionPage.vue'
import QuizPage from './pages/QuizPage.vue'
import NewQuestions from './pages/NewQuestions.vue'
import ImportMoodleXML from './pages/ImportMoodleXML.vue'
import wdid from './config/wdid.js'
import wikibase_default_site from './config/wikibase_default_site.js'
import WikibaseItem from './mixins/WikibaseItem.js'
import i18n from './components/i18n.vue'

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

	if ( typeof Cookies.get('comprende_language') == 'undefined' ) {
		Cookies.set('comprende_language',wikibase_default_site.language) ;
		Cookies.set('comprende_fallback_languages',wikibase_default_site.fallback_languages.join('|')) ;
	} else {
		wikibase_default_site.language = Cookies.get('comprende_language') ;
		wikibase_default_site.fallback_languages = Cookies.get('comprende_fallback_languages').split('|') ;
	}
	

	var cnt = 0 ;
	function fin () {
		if ( --cnt > 0 ) return ;
		router = new VueRouter({routes}) ;
		app = new Vue ( { router } ) .$mount('#app') ;
	}
	
	function loadUserInfo () {
		cnt++ ;
		$.get ( wikibase_default_site.api , {
			action:'query',
			meta:'userinfo',
			format:'json'
		} , function ( d ) {
			meta.userinfo = d.query.userinfo ;
			if ( meta.isLoggedIn() ) {
				wikibase_default_site.edit.can_edit = true ;
			}
		} , 'json' ) . always ( fin ) ;
	}
	
	function loadI18n () {
		cnt++ ;
		var i = new Vue ( { mixins : [ i18n ] } ) ;
		i.loadTranslations ( fin ) ;
	}
	
	loadUserInfo() ;
	loadI18n() ;
	
} ) ;
