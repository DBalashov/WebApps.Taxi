<template>
    <div class="cars">
        <CarsItem v-bind:parentID="null"
                    v-bind:treeGroups="treeGroups"
                    v-bind:treeCars="treeCars"
                    v-bind:activeItem="activeItem"
                    v-bind:commandStatusCars="commandStatusCars">
        </CarsItem>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { $bus } from '../main';
    import CarsItem from '@/components/CarsItem.vue';

    @Component({
        components: {
            CarsItem
        }
    })
    export default class Cars extends Vue {
        @Prop() private treeGroups!: any;
        @Prop() private treeCars!: any;
        @Prop() private commandStatusCars!: any;

        private activeItem: string = '';

        private created() {
            $bus.$on('SelectGroupItem', (id: string) => this.activeItem = id);
            $bus.$on('SelectCarItem', (id: string) => this.activeItem = id);
        }
    }
</script>

<style lang="scss">
    .cars {
        height: 50vh;
        overflow: auto;
        padding: .5em 0 0 1em;

        &__list {
            padding-left: .75em;
        }

        &__name {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            border-bottom: 1px solid #eee;

            &:hover &-link {
                background: rgba(255, 198, 93, 0.25);
            }

            &-link {
                flex: 1;
                padding: 0 .25em;
            }
        }

        &__state {
            position: relative;
            display: inline-block;
            width: 20px;
            height: 20px;
            margin-left: .5px;
            cursor: pointer;

            &:before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 6px;
                height: 6px;
                margin: -3px 0 0 -3px;
                border-radius: 50%;
            }

            &--on:before {
                background: #47bb00;
            }

            &--off:before {
                background: #f00;
            }
        }

        &__item--active > &__name &__name-link {
            background: #ffc65d;
        }
    }
</style>
