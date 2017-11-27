<template>
  <div>
    <div
      class="rc-group-background"
      :style="{
                'position': 'absolute',
                'top': `${group.backgroundTop}px`,
                'left': `${group.backgroundLeft}px`,
                'width': `${group.backgroundWidth}px`,
                'height': `${group.backgroundHeight}px`,
              }"
    />
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
	},
  created: function(){
  },
}
</script>

<style lang="scss" scoped>
@import '../variables.scss';

.rc-group-background{
  background: $rc-lightblue;
  border-radius: 0.5em;
  
}


</style>