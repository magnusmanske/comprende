<template>
<div>
<!-- Not used? -->
</div>
</template>

<script>

export default {
  name: 'app',
}
</script>

<style>
div.dontshow {
	display:none;
}
div.page {
	margin-left:auto;
	margin-right:auto;
	max-width:960px;
}
.card-stack {
	margin-top:5px;
	margin-bottom:5px;
}
.license_note {
	font-size:8pt;
	text-align:right;
	margin:2px;
	color:#DDD;
}
a.external {
	color:#2DC800;
}
a.wikipedia {
}
a.wb { /* The local WikiBase installation */
	color:#2966B8;
}

@media screen and (orientation:portrait) {

div.bottom_buttons {
	position:fixed;
	text-align:center;
	background-color:white;
	left:0px;
	right:0px;
	bottom:0px;
	border-top:1px solid #DDD;
	padding-top:2px;
	height:3rem;
}

}

@media screen {
	.print-only {
		display:none !important;
	}
}

@media print
{    
    .no-print, .no-print *
    {
        display: none !important;
    }
}

</style>
