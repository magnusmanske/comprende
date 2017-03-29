// Global object for central cache etc.
// You can override most queries and specify your own, bespoke object
export default {
	api : 'https://tools.wmflabs.org/comprende/api.php' , //'https://www.wikidata.org/w/api.php' ,
	item_cache : {} ,
	language : 'en' ,
	fallback_languages : [ 'de' , 'es' , 'fr' , 'it' , 'nl' , 'zh' ]
}
