<script>
import { wdid , wikibase_default_site } from '../config.js'

export default {
	data : function () { return { question_id_counter:0 } } ,
	methods : {
		getCurrentLanguage : function () {
			return wikibase_default_site.language ;
		} ,
		getNewQuestion : function ( type , props ) {
			var me = this ;
			var ret = {
				id : me.question_id_counter++ ,
				type : type ,
				label : { text:'' , language:me.getCurrentLanguage() , item:'' } ,
				text : { text:'' , language:me.getCurrentLanguage() , item:'' } ,
				hint : { text:'' , language:me.getCurrentLanguage() , item:'' } ,
				answers : [] ,
				transclusions : [] ,
				import2wb : true ,
				add2quiz : true ,
				can_be_imported : true ,
			} ;

			if ( type == wdid.q_multiple_choice_question ) {
			}
			if ( type == wdid.q_label_item_question ) {
				ret.crop = [0,0,100,100] ;
				ret.image = '' ;
			}

			$.each ( (props||{}) , function ( k , v ) {
				ret[k] = v ;
			} ) ;
			return ret ;
		} ,
	}
} ;

</script>