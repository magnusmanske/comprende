<template>
<div>

<div v-if='loaded'>
	<mediawiki-transclusion v-for='w in wp' :page_url='w.page_url' :section='w.section' :oldid='w.oldid' :detailed='detailed'></mediawiki-transclusion>
</div>

<div v-else><i><i18n k='loading'/></i></div>

</div>
</template>


<script>
import i18n from '../i18n.vue'
import { wdid } from '../../config.js'
import wikibaseAPImixin from '../../mixins/wikibaseAPImixin.js'
import mediawiki_transclusion from './mediawiki-transclusion.vue'

export default {
	mixins : [ wikibaseAPImixin ] ,
	components : { i18n , 'mediawiki-transclusion':mediawiki_transclusion } ,
	props : [ 'q' , 'detailed' ] ,
	data : function () { return { wp:[] , loaded:false } } ,
	created : function () { this.init() } ,
	methods : {
		init : function () {
			var me = this ;
			me.loaded = false ;
			me.wp = [] ;
			var i = me.getItem ( me.q ) ;
			
			var running = 1 ;
			function fin () {
				if ( --running > 0 ) return ;
				me.loaded = true ;
			}
			
			// Wikipedia section
			$.each ( i.getStatements(wdid.p_wikipedia_page) , function ( num , s ) {
				var url = s.mainsnak.datavalue.value ;
				var m = url.match ( /^(https{0,1}:\/\/.+?)\/wiki\/(.+)$/ ) ;
				if ( m === null ) return ; // Paranoia
				
				
				var api = m[1] + '/w/api.php?callback=?' ;
				var page = m[2] ;
				// https://en.wikipedia.org/w/api.php?action=parse&oldid=755909779&section=0&prop=text&disabletoc=1&mobileformat=1&noimages=1
				
				var oldid ;
				var section ;
				
				if ( typeof s.qualifiers != 'undefined' ) {
					if ( typeof s.qualifiers[wdid.p_wikipedia_oldid] != 'undefined' ) oldid = s.qualifiers[wdid.p_wikipedia_oldid][0].datavalue.value.amount*1 ;
					if ( typeof s.qualifiers[wdid.p_wikipedia_section] != 'undefined' ) section = s.qualifiers[wdid.p_wikipedia_section][0].datavalue.value.amount*1 ;
				}
				
				if ( typeof section == 'undefined' ) return ; // Transclude only section

				me.wp.push ( {
					page_url : s.mainsnak.datavalue.value ,
					section ,
					oldid ,
				} ) ;
				
			} ) ;
			
			fin() ;
		}
	} ,
	watch : {
		q : function () { this.init() } 
	} ,
}
</script>

<style>
</style>