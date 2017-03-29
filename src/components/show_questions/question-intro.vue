<template>
<div>

<div v-if='loaded'>
<div v-for='t in wp' class='wikipedia_section'>
<div style='font-family:monospace;float:right;margin-left:5px;margin-bottom:5px;'>[<a target='_blank' :href='t.url'>WP</a>]</div>
<div v-html='t.text'></div>
</div>
</div>

<div v-else><i>Loading...</i></div>

</div>
</template>


<script>
import wdid from '../../config/wdid.js'
import wikibaseAPImixin from '../../mixins/wikibaseAPImixin.js'

export default {
	mixins : [ wikibaseAPImixin ] ,
	props : [ 'q' ] ,
	data : function () { return { wp:[] , loaded:false } } ,
	created : function () { this.init() } ,
	methods : {
		wp_html2text : function ( s ) {
			var o = $(s) ;
			o.find('script').remove() ;
			o.find('ol.references').remove() ;
			o.find('sup.reference').remove() ;
			o.find('a').each ( function () { $(this).replaceWith ( $(this).text() ) } ) ;
			s = o.html() ;
			return s ;
		} ,
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
				
				var params = { action:'parse' , prop:'text' , format:'json' , disabletoc:1 , mobileformat:1 , noimages:1 , section:section } ;
				if ( typeof oldid == 'undefined' ) params.title = page ;
				else params.oldid = oldid ;
				
				running++ ;
				$.getJSON ( api , params , function ( d ) {
					if ( typeof (d.parse||{}).text == 'undefined' ) return ;
					me.wp.push ( { text:me.wp_html2text(d.parse.text['*']) , format:'html' , url:url } ) ;
				} )
				.always ( fin ) ;
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