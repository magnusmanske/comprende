<template>
<span>
<span v-if='editing'><i>EDITING TRANSLATION...</i></span>
<span v-else-if='available'>
	<span v-html='translation'></span>
	<span v-if='is_fallback' class='comprende_i18n_language' @click.prevent.stop='clickTranslate' :title='translate_title'>[{{fallback_lang}}]</span>
	<span v-else-if='user.settings.edit_interface_translations' class='comprende_i18n_language' @click.prevent.stop='clickTranslate' :title='translate_title'>[{{getMainLanguage()}}]</span>
</span>
<span v-else><i>{{no_translation_available}}:</i> (<tt>{{k}}</tt>) <span class='comprende_i18n_language' @click.prevent.stop='clickTranslate'>[{{translate_title}}]</span></span>
</span>
</template>


<script>
import { user , wdid , wikibase_default_site } from '../config.js'
import WikibaseItem from '../mixins/WikibaseItem.js'
import wikibaseAPImixin from '../mixins/wikibaseAPImixin.js'

export default {
	props : [ 'k' , 'params' ] ,
	mixins : [ wikibaseAPImixin ] ,
	data : function () { return { editing:false , translation:'',available:false,is_fallback:false,fallback_lang:'',translate_title:'',no_translation_available:'' , user } } ,
	created : function () { this.render() } ,
	methods : {
		render : function () {
			var me = this ;
			me.available = false ;
			me.translation = '' ;
			me.is_fallback = false ;
			me.fallback_lang = '' ;
			var t = me.getTranslation ( me.k , me.params ) ;
			if ( typeof t == 'undefined' ) return me.setTranslateTitle() ;

			me.available = true ;
			me.translation = t.translation ;
			if ( t.language != me.getMainLanguage() ) {
				me.is_fallback = true ;
				me.fallback_lang = t.language ;
				me.setTranslateTitle() ;
			}
		} ,
		setTranslateTitle : function () {
			var me = this ;
			if ( me.translate_title != '' ) return ;
			var t = me.getTranslation ( 'translate_to' , me.getAllUserLanguages() ) ;
			if ( typeof t == 'undefined' ) return ;
			me.translate_title = t.translation ;
			t = me.getTranslation ( 'no_translation_available' , me.getAllUserLanguages() ) ;
			me.no_translation_available = t.translation ;
		} ,
		getAllUserLanguages : function () {
			var ret = [ this.getMainLanguage() ] . concat ( wikibase_default_site.fallback_languages ) ;
			if ( -1 == ret.indexOf('en') ) ret.push ( 'en' ) ; // Hardcoded fallback language as last resort
			return ret ;
		} ,
		tr : function ( key , params ) {
			var tr = this.getTranslation ( key , params ) ;
			if ( typeof tr == 'undefined' ) return 'no translation: ' + key ;
			return tr.translation + (tr.language==this.getMainLanguage()?'':' ['+tr.language+']') ;
		} ,
		getTranslation : function ( _key , params ) {
			if ( typeof _key == 'undefined' ) return ;
			var me = this ;
			var ret ;
			var langs = me.getAllUserLanguages() ;
			var key = $.trim(_key.toLowerCase()).replace(/ /g,'_') ;
			var kv = wikibase_default_site.i18n[key] ;
			if ( typeof kv == 'undefined' ) return ;
			$.each ( langs , function ( num , l ) {
				if ( typeof kv.data[l] == 'undefined' ) return ;
				var t = kv.data[l].text ;
				$.each ( (params||[]) , function ( num0 , p ) {
					var regex = new RegExp ( '\\$'+(num0+1)+'\\b' , 'g' ) ;
					t = t.replace ( regex , p ) ;
				} ) ;
				ret = { language:l , translation:t } ;
				return false ;
			} ) ;
			return ret ;
		} ,
		getMainLanguage : function () {
			return wikibase_default_site.language ;
		} ,
		clickTranslate : function () {
			var me = this ;
			var t = me.getTranslation ( 'translate_to' , me.getAllUserLanguages() ) ;
			var initial_value = '' ;
			var tv = me.getTranslation ( me.k ) ;
			if ( typeof tv != 'undefined' ) initial_value = tv.translation ;
			var result = prompt ( t.translation , (initial_value==''?me.k.replace(/_/g,' '):initial_value) ) ;
			if ( result === null || result == initial_value ) return ;
			me.setTranslation ( me.k , me.getMainLanguage() , result ) ;
		} ,
		setTranslation : function ( _key , lang , text ) {
			var me = this ;
			var i = me.getItem ( wdid.q_i18n ) ;
			var key = $.trim(_key.toLowerCase()).replace(/ /g,'_') ;
			var kv = wikibase_default_site.i18n[key] ;
			
			me.editing = true ;
			
			var params = {} ;

			if ( typeof kv == 'undefined' ) { // Add new statement

				var qual = me.newClaimMonolingual ( {
					text:text ,
					language:lang ,
					property:wdid.p_translation
				} ) . mainsnak ;

				var data = me.newClaimString ( {
					value:key,
					property:wdid.p_translation_key ,
					qualifiers : [ qual ]
				} ) ;
				
				params = {
					action:'wbeditentity' ,
					id:wdid.q_i18n ,
					data:JSON.stringify ( {claims:[data]} )
				} ;

			} else { // Add/replace qualifier
			
				var value = {
					text:text ,
					language:lang
				} ;
			
				params = {
					action:'wbsetqualifier',
					claim:kv.statement_id,
					property:wdid.p_translation ,
					snaktype:'value' ,
					value:JSON.stringify(value)
				} ;

				if ( typeof kv.data[lang] != 'undefined' ) {
					params.snakhash = kv.data[lang].hash ;
				}
				
			}

			me.getToken ( function ( token ) {
				params.token = token ;
				params.format = 'json' ;
				$.post ( wikibase_default_site.api , params , function ( d ) {
					if ( d.success ) {
						me.reloadItems ( [ wdid.q_i18n ] , function () {
							me.loadTranslations ( function () {
								me.editing = false ;
								me.render() ;
							} ) ;
						} ) ;
					} else {
						console.log ( d ) ;
						alert ( d.error.info ) ;
						me.editing = false ;
					}
				} , 'json' )
				. fail ( function () { me.editing = false } )
			} ) ;
			
		} ,
		loadTranslations : function ( callback ) {
			var me = this ;
			wikibase_default_site.i18n = {} ;
			me.loadItems ( [ wdid.q_i18n ] , function () {
				var d = me.getItem ( wdid.q_i18n ) ;
				$.each ( d.json.claims[wdid.p_translation_key] , function ( k0 , v0 ) {
					var key = v0.mainsnak.datavalue.value ;
					if ( typeof key == 'undefined' ) console.log ( v0 ) ;
					key = $.trim(key.toLowerCase()).replace(/ /g,'_');
					wikibase_default_site.i18n[key] = { statement_id:v0.id , data:{} } ;
					$.each ( ((v0.qualifiers||{})[wdid.p_translation]||{}) , function ( k1 , v1 ) {
						var l = v1.datavalue.value.language ;
						var t = v1.datavalue.value.text ;
						wikibase_default_site.i18n[key].data[l] = { text:t , hash:v1.hash } ;
					} ) ;
				} ) ;
				if ( typeof callback != 'undefined' ) callback() ;
			} ) ;
		} ,
	} ,
	watch : {
		'wikibase_default_site.language' : function () { this.render() } ,
		'wikibase_default_site.fallback_languages' : function () { this.render() } ,
		'wikibase_default_site.i18n' : function () { this.render() } ,
		'wikibase_default_site.edit' : {
			handler : function () { this.render() } ,
			deep : true
		}
	}
}
</script>

<style>
span.comprende_i18n_language {
	font-size:0.75em;
	color:#DDD;
}
span.comprende_i18n_language:hover {
	color:black;
	text-decoration: underline;
}
</style>
