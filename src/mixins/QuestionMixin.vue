<script>
export default {
	data : function () { return { title:'' , subtitle:'' } } ,
	methods : {
		shuffle : function (array) {
		  var currentIndex = array.length, temporaryValue, randomIndex;

		  // While there remain elements to shuffle...
		  while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		  }

		  return array;
		} ,
		setTitle : function () {
			var me = this ;
			me.title = me.i.getLabel()[0] ;
			me.subtitle = me.i.getDescription()[0] ;
		} ,
	}
}
</script>