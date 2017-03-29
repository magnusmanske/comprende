import wikibase_default_site from '../config/wikibase_default_site.js'
import WikibaseItem from './WikibaseItem.js'

export default {
	methods : {
		hasItem : function ( item ) {
			return this.hasItemSite ( wikibase_default_site , item ) ;
		} ,
		getItem : function ( item ) {
			return this.getItemSite ( wikibase_default_site , item ) ;
		} ,
		searchEntity : function ( s , type , callback ) {
			this.searchEntitySite ( wikibase_default_site , s , type , callback ) ;
		} ,
		loadItems : function ( items , callback ) {
			this.loadItemsSite ( wikibase_default_site , items , callback ) ;
		} ,
		
		getCurrentLanguage : function () {
			return wikibase_default_site.language ;
		} ,
		
		newClaimAddQualifiers : function ( ret , o ) {
			if ( typeof o.qualifiers == 'undefined' ) return ;
			if ( o.qualifiers.length == 0 ) return ;
			ret.qualifiers = o.qualifiers ;
		} ,
		newClaimItem : function ( o ) {
			if ( typeof o.id == 'undefined' || $.trim(o.id) == '' ) console.log ( "newClaimItem: No ID given" ) ;
			if ( typeof o.property == 'undefined' || $.trim(o.property) == '' ) console.log ( "newClaimItem: No property given" ) ;
			o.id = String ( o.id ) ;
			var ret = {
				mainsnak: {
					snaktype:'value' , 
					property:o.property , 
					datavalue: {
						value : {
							'entity-type':(o.entity_type||'item') ,
							id:o.id ,
							'numeric-id':parseInt(o.id.replace(/\D/g,''))
						} ,
						type:'wikibase-entityid'
					} ,
					datatype:'wikibase-item'
				} , 
				type:(o.type||'statement') , 
				rank:(o.rank||'normal')
			} ;
			this.newClaimAddQualifiers ( ret , o ) ;
			return ret ;
		} ,
		newClaimQuantity : function ( o ) {
			if ( typeof o.amount == 'undefined' || $.trim(String(o.amount)) == '' ) console.log ( "newClaimQuantity: No amount given" ) ;
			if ( typeof o.property == 'undefined' || $.trim(o.property) == '' ) console.log ( "newClaimQuantity: No property given" ) ;
			o.amount = String ( o.amount ) ;
			if ( o.amount * 1 > 0 ) o.amount = '+' + o.amount ;
			var ret = {
				mainsnak: {
					snaktype:'value' , 
					property:o.property , 
					datavalue: {
						value:{
							amount:o.amount,
							unit:(o.unit||"1")
						} ,
						type:'quantity'
					} ,
					datatype:'quantity'
				} , 
				type:(o.type||'statement') , 
				rank:(o.rank||'normal')
			} ;
			this.newClaimAddQualifiers ( ret , o ) ;
			return ret ;
		} ,
		newClaimString : function ( o ) {
			if ( typeof o.property == 'undefined' || $.trim(o.property) == '' ) console.log ( "newClaimString: No property given" ) ;
			var ret = {
				mainsnak: {
					snaktype:'value' , 
					property:o.property , 
					datavalue: {
						value:o.value.substr(0,390),
						type:'string'
					}
				} , 
				type:(o.type||'statement') , 
				rank:(o.rank||'normal')
			} ;
			this.newClaimAddQualifiers ( ret , o ) ;
			return ret ;
		} ,
		newClaimMonolingual : function ( o ) {
			if ( typeof o.text == 'undefined' || $.trim(o.text) == '' ) console.log ( "newClaimMonolingual: No text given" ) ;
			if ( typeof o.language == 'undefined' || $.trim(o.language) == '' ) console.log ( "newClaimMonolingual: No language given" ) ;
			if ( typeof o.property == 'undefined' || $.trim(o.property) == '' ) console.log ( "newClaimMonolingual: No property given" ) ;
			var ret = {
				mainsnak: {
					snaktype:'value' , 
					property:o.property , 
					datavalue: {
						value:{
							text:o.text.substr(0,390),
							language:o.language
						},
						type:'monolingualtext'
					} ,
					datatype:'monolingualtext'
				} , 
				type:(o.type||'statement') , 
				rank:(o.rank||'normal')
			} ;
			this.newClaimAddQualifiers ( ret , o ) ;
			return ret ;
		} ,
		
		
		getToken : function ( callback ) {
			this.getTokenSite ( wikibase_default_site , callback ) ;
		} ,



		getTokenSite : function ( site , callback ) {
			$.get ( site.api , {
				action:'query',
				meta:'tokens',
				format:'json'
			} , function ( d ) {
				callback ( d.query.tokens.csrftoken ) ;
			} , 'json' ) ;
		} ,
		
		hasItemSite : function ( site , item ) {
			return ( typeof site.item_cache[item] != 'undefined' ) ;
		} ,
		getItemSite : function ( site , item ) {
			return site.item_cache[item] ;
		} ,
		searchEntitySite : function ( site , s , type , callback ) {
			var result = { search:[] } ;
			$.getJSON ( site.api+'?callback=?' , {
				action:'wbsearchentities',
				search:s,
				type:type,
				language:wikibase_default_site.language,
				format:'json'
			} , function ( d ) {
				result = d ;
			} ).always ( function () {
				callback ( result ) ;
			} ) ;
		} ,
		loadItemsSite : function ( site , items , callback ) {
			var me = this ;
			var cnt = 0 ;
			
			function fin () {
				if ( --cnt > 0 ) return ;
				callback() ;
			}
			
			// Init
			var groups = {} ; // Separating into Q, P etc. might not be necessary, but it feels future-proof...
			$.each ( items , function ( dummy , item ) {
				if ( typeof item == 'undefined' ) return ;
				var i = $.trim ( item.toUpperCase() ) ;
				if ( typeof site.item_cache[i] != 'undefined' ) return ; // We already have that in the cache
				var type = i.substr(0,1) ;
				if ( typeof groups[type] == 'undefined' ) groups[type] = {} ;
				groups[type][i] = i ;
				cnt++ ;
			} ) ;
			if ( cnt == 0 ) return fin () ; // All in cache already, my work here is done

			cnt = 0 ;
			$.each ( groups , function ( group , items ) {
				var tmp = [ [] ] ;
				$.each ( items , function ( dummy , i ) {
					if ( tmp[tmp.length-1].length >= 50 ) tmp.push ( [] ) ;
					tmp[tmp.length-1].push ( i ) ;
				} ) ;
				$.each ( tmp , function ( dummy , subgroup ) {
					cnt++ ;
					$.getJSON ( site.api+'?callback=?' , {
						action:'wbgetentities',
						ids:subgroup.join('|'),
						format:'json'
					} , function ( d ) {
						$.each ( d.entities , function ( k , v ) {
							site.item_cache[k] = new WikibaseItem ( v ) ;
						} ) ;
					} )
					.fail ( function () {} ) // TODO
					.always ( function () { fin() } ) ;
				} ) ;
			} ) ;
		}
	}
}