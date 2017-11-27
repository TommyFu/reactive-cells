<template>
  <div>
    <div
      :class="classObject"
      :style="{
                'text-align': 'center',
                'line-height': `${cell.heightPx}px`
              }"
      @mousedown="onMouseDown"
    >
      {{`${cell.name}`}}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    cell: {
      type: Object,
      required: true
    },
    onDragStart: {
      type: Function,
      required: true
    }
  },
  computed: {
    classObject: function(){
      let res = {
        'rc-cell-content': true
      };
      res[`x#${this.cell.mapX}`] = true;
      res[`y#${this.cell.mapY}`] = true;
      res[`g#${this.cell.groupId}`] = true;
      return res;
    }
  },
  methods: {
    onMouseDown: function(event){
      let targetClass = event.target.getAttribute('class');
      if(typeof targetClass === "string" 
        && targetClass.indexOf("item-remove-icon") !== -1){
        return;
      }

      if(event.preventDefault){
        event.preventDefault();
      }
      if(this.onDragStart){
        this.onDragStart(event);
      }
    },
	},
}
</script>

<style lang="scss" scoped>
@import '../variables.scss';

.rc-cell{
  background: $rc-blue;
}

.rc-cell-content{
  width: 100%;
  height: 100%;

  /* background: url(http://thecatapi.com/api/images/get?format=src&type=png); */
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
}

</style>