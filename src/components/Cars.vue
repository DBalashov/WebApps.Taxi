<template>
    <div class="cars">
        <CarsItem v-bind:parentID="null"
                    v-bind:treeGroups="treeGroups"
                    v-bind:treeCars="treeCars"
                    v-bind:activeItem="activeItem"
                    v-bind:commandStatusCars="commandStatusCars"
                    v-bind:commandStatusOk="commandStatusOk">
        </CarsItem>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { $bus } from '../main';
    import { DCStatus } from '../assets/ts/ServiceConnector';
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
        @Prop() private commandStatusOk!: DCStatus;

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
        padding: .5em 0 .5em 1em;

        &__list {
            padding-left: .75em;
        }

        &__name {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            border-bottom: 1px solid #eee;

            &:hover {
                background: rgba(246, 185, 59, 0.25);
            }

            &-link {
                flex: 1;
                padding: 0 .25em;
            }
        }

        &__vrn {
            width: 6em;
        }

        &__state {
            position: relative;
            display: inline-block;
            width: 20px;
            height: 20px;
            margin-left: .5px;

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
                background: #78e08f;
            }

            &--off:before {
                background: #e55039;
            }
        }

        &__item--active > &__name {
            background: #f6b93b;
        }
    }
</style>
