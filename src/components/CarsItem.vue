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
                                v-bind:commandStatusCars="commandStatusCars"
                                v-bind:commandStatusOk="commandStatusOk">
                    </CarsItem>
                </template>
                <template v-if="treeCars[group.ID]">
                    <div v-for="item in treeCars[group.ID]" v-bind:class="{ 'cars__item': true, 'cars__item--active': item.ID == activeItem }">
                        <div class="cars__name" @click="clickCarItem(item.ID)">
                            <span class="cars__name-link">{{ item.Name }}</span>
                            <template v-for="p in item.Properties">
                                <span v-if="p.Name == 'VehicleRegNumber'" class="cars__vrn">
                                    {{ p.Value }}
                                </span>
                            </template>
                            <span v-bind:class="{'cars__state': true, 'cars__state--unknown': state(commandStatusCars[item.ID]) === 0, 'cars__state--on': state(commandStatusCars[item.ID]) === 1, 'cars__state--off': state(commandStatusCars[item.ID]) === -1}"></span>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { DCStatus, ICommandResultItem } from '../assets/ts/ServiceConnector';
    import { $bus } from '../main';

    @Component
    export default class CarsItem extends Vue {
        @Prop() private treeGroups!: any;
        @Prop() private treeCars!: any;
        @Prop() private commandStatusCars!: any;
        @Prop() private commandStatusOk!: DCStatus;
        @Prop() private parentID!: string;
        @Prop() private activeItem!: string;

        private clickGroupItem(id: string, e: MouseEvent): void {
            e.preventDefault();

            $bus.$emit('SelectGroupItem', id);
        }

        private clickCarItem(id: string): void {
            $bus.$emit('SelectCarItem', id);
        }

        private state(commandStatusCar: ICommandResultItem | undefined): number {
            if (commandStatusCar === undefined) return 0;
            if (commandStatusCar.Status === this.commandStatusOk && commandStatusCar.Arguments.includes('1')) return 1;
            if (commandStatusCar.Status === this.commandStatusOk && commandStatusCar.Arguments.includes('0')) return -1;
            return 0;
        }
    }
</script>

<style lang="scss">

</style>
