import wikibase_default_site from '../config/wikibase_default_site.js'

// Item class
export default function ( _json ) {
	this.json = _json ;
	
	this.getCurrentLanguage = function () {
		return wikibase_default_site.language ;
	}

	this.getID = function () {
		return this.json.id ;
	}
	
	this.getPage = function () {
		var id = this.getID() ;
		if ( id.match ( /^P/ ) ) return "Property:" + id ;
		return id ;
	}

	this.getLabel = function ( language ) {
		return this.getLabelOrDescription ( language , 'labels' ) ;
	}
	
	this.getDescription = function ( language ) {
		return this.getLabelOrDescription ( language , 'descriptions' ) ;
	}
	
	this.getAliases = function ( language ) {
		var me = this ;
		var ret = [] ;
		if ( typeof language == 'undefined' ) language = me.getCurrentLanguage() ;
		if ( typeof me.json == 'undefined' ) return ret ;
		if ( typeof me.json.aliases == 'undefined' ) return ret ;
		if ( typeof me.json.aliases[language] == 'undefined' ) return ret ;
		$.each ( me.json.aliases[language] , function ( k , v ) {
			ret.push ( v.value ) ;
		} ) ;
		return ret ;
	}
	
	this.getItemValues = function ( prop ) {
		var me = this ;
		var ret = [] ;
		if ( typeof me.json == 'undefined' ) return ret ;
		if ( typeof me.json.claims == 'undefined' ) return ret ;
		if ( typeof me.json.claims[prop] == 'undefined' ) return ret ;
		$.each ( me.json.claims[prop] , function ( k , v ) {
			if ( typeof v.mainsnak == 'undefined' ) return ;
			if ( typeof v.mainsnak.datavalue == 'undefined' ) return ;
			if ( v.mainsnak.datavalue.type != 'wikibase-entityid' ) return ;
			ret.push ( v.mainsnak.datavalue.value.id ) ;
		} ) ;
		return ret ;
	}

	this.getStatements = function ( prop ) {
		var me = this ;
		var ret = [] ;
		if ( typeof me.json == 'undefined' ) return ret ;
		if ( typeof me.json.claims == 'undefined' ) return ret ;
		if ( typeof me.json.claims[prop] == 'undefined' ) return ret ;
		$.each ( me.json.claims[prop] , function ( k , v ) {
			ret.push ( v ) ;
		} ) ;
		return ret ;
	}
		
	this.getStringValues = function ( prop ) {
		var me = this ;
		var ret = [] ;
		if ( typeof me.json == 'undefined' ) return ret ;
		if ( typeof me.json.claims == 'undefined' ) return ret ;
		if ( typeof me.json.claims[prop] == 'undefined' ) return ret ;
		$.each ( me.json.claims[prop] , function ( k , v ) {
			if ( typeof v.mainsnak == 'undefined' ) return ;
			if ( typeof v.mainsnak.datavalue == 'undefined' ) return ;
			if ( v.mainsnak.datavalue.type != 'string' ) return ;
			ret.push ( v.mainsnak.datavalue.value ) ;
		} ) ;
		return ret ;
	}
	
	this.getLabelOrDescription = function ( language , mode , stop_recurse ) {
		var me = this ;
		var ret = mode == 'labels' ? me.getID() : '' ; // Fallback
		if ( typeof language == 'undefined' ) language = me.getCurrentLanguage() ;

		if ( typeof me.json == 'undefined' ) return ret ;
		if ( typeof me.json[mode] == 'undefined' ) return ret ;

		if ( typeof me.json[mode][language] != 'undefined' && typeof me.json[mode][language].value != 'undefined' ) {
			ret = me.json[mode][language].value ;
		} else if ( !stop_recurse ) {
			$.each ( wikibase_default_site.fallback_languages , function ( dummy , lang ) {
				if ( typeof me.json[mode][lang] == 'undefined' || typeof me.json[mode][lang].value == 'undefined' ) return ;
				ret = me.json[mode][lang].value ;
				language = lang ;
				return false ;
			} ) ;
		}
		return [ ret , language ] ;
	}
	
	this.getStatementByID = function ( id ) {
		var me = this ;
		var ret ;
		$.each ( ((me.json||{}).claims||{}) , function ( p , v ) {
			$.each ( v , function ( k1 , v1 ) {
				if ( v1.id == id ) ret = v1 ;
			} ) ;
		} ) ;
		return ret ;
	}
}

