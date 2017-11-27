<template>
	<div id="app">
		<ReactiveCells
			:groups="groups" 
		/>
	</div>
</template>

<script>
import ReactiveCells from './components/ReactiveCells.vue'

const GROUP_COUNT = 5;
const CELL_COUNT = 10;
const CELL_MAX_WIDTH = 3;
const CELL_MAX_HEIGHT = 3;
let groupId = 1;
let cellId = 1;

export default {
	components: {
		ReactiveCells
	},
	data() {
    return {
      groups: []
    }
  },
	created: function(){
		this.$data.groups = this.initGroupsAndCells();
	},
	methods: {
		_random: function(min, max){
      return Math.floor(Math.random() * (max - min + 1) + min);
    },
		initGroupsAndCells: function(){
      function Cell(cellId, name, width, height){
        this.id = cellId;
        this.name = name;
        this.width = width;
        this.height = height;
      }

      let groups = [];
      for(let i = 0; i < GROUP_COUNT; i++){
        let groupName = `group${groupId++}`;
        let group = {
          id: groupName,
          name: groupName,
          cells: []
        }
        for(let j = 0; j < CELL_COUNT; j++){
          let cellName = `cell${cellId++}`;
          let cell = new Cell(cellName, cellName, //2, 2);
            this._random(1, CELL_MAX_WIDTH),
            this._random(1, CELL_MAX_HEIGHT));
          group.cells.push(cell);
        }
        groups.push(group);
      }
      return groups;
		},
	},
}
</script>

<style lang="scss">
*, *::before, *::after {
	box-sizing: border-box;
}

#app {
	width: 80%;
	margin: 0 auto;
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

</style>