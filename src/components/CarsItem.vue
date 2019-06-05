<template>
    <div class="cars__level">
        <div v-for="group in treeGroups[parentID]" v-bind:class="{ 'cars__item': true, 'cars__item--active': group.ID == activeItem }">
            <div class="cars__name">
                <a href="#no-click" class="cars__name-link" @click="clickGroupItem(group.ID, $event)">{{ group.Name }}</a>
            </div>
            <div class="cars__list">
                <template v-if="treeGroups[group.ID]">
                    <CarsItem v-bind:parentID="group.ID"
                                v-bind:treeGroups="treeGroups"
                                v-bind:treeCars="treeCars"
                                v-bind:activeItem="activeItem"
                                v-bind:commandStatusCars="commandStatusCars">
                    </CarsItem>
                </template>
                <template v-if="treeCars[group.ID]">
                    <div v-for="item in treeCars[group.ID]" v-bind:class="{ 'cars__item': true, 'cars__item--active': item.ID == activeItem }">
                        <div class="cars__name">
                            <a href="#no-click" class="cars__name-link" @click="clickCarItem(item.ID, $event)">{{ item.Name }}</a>
                            <span v-bind:class="{'cars__state': true, 'cars__state--on': commandStatusCars[item.ID] && commandStatusCars[item.ID] == 1, 'cars__state--off': ! commandStatusCars[item.ID] || commandStatusCars[item.ID] && commandStatusCars[item.ID] != 1}"></span>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { $bus } from '../main';
    import { DCStatus } from '../assets/ts/ServiceConnector';

    @Component
    export default class CarsItem extends Vue {
        @Prop() private treeGroups!: any;
        @Prop() private treeCars!: any;
        @Prop() private commandStatusCars!: any;
        @Prop() private parentID!: string;
        @Prop() private activeItem!: string;

        private mounted() {

        }

        private clickGroupItem(id: string, e: MouseEvent): void {
            e.preventDefault();

            $bus.$emit('SelectGroupItem', id);
        }

        private clickCarItem(id: string, e: MouseEvent): void {
            e.preventDefault();

            $bus.$emit('SelectCarItem', id);
        }
    }
</script>

<style lang="scss">

</style>
