<template>
  <div>
    <div>{{group.name}}</div>
  </div>
</template>

<script>

export default {
  components: {
	},
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  methods: {
		foo () {
			
		},
	},
  created: function(){
    
  },
}
</script>

<style lang="scss" scoped>


</style>