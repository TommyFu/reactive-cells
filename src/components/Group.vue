<template>
  <div>
    <GroupBackground
      :key="'background-' + group.id"
      :group="group"
    />
    <GroupLayout 
      class="rc-group-layout"
      :key="'layout-' + group.id"
      :group="group"
      :style="{
                'position': 'absolute',
                'top': `${group.top}px`,
                'left': `${group.left}px` 
              }"
    />
    <Cell
      v-for="cell in group.cells"
      class="rc-cell"
      :id="cell.name"
      :key="cell.id"
      :cell="cell"
      :style="{
                'width': `${cell.widthPx}px`,
                'height': `${cell.heightPx}px`,
                'position': 'absolute',
                'top': `${cell.top}px`,
                'left': `${cell.left}px` 
              }"
      :onDragStart="onDragStart"
    />
  </div>
</template>

<script>
import Cell from './Cell.vue';
import GroupLayout from './GroupLayout.vue';
import GroupBackground from './GroupBackground.vue';

export default {
  components: {
		Cell,
    GroupLayout,
    GroupBackground
	},
  props: {
    group: {
      type: Object,
      required: true
    },
    onDragStart: {
      type: Function,
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

</style>