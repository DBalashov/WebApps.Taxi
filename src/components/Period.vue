<template>
    <div class="period">
        <button v-on:click="currentTrip.Shift(-1)" class="period__down">&lt;</button><!--
        --><span class="period__date">{{currentTrip.S.D}} {{currentTrip.S.T}}</span><!--
        --><span>&mdash;</span><!--
        --><span class="period__date">{{currentTrip.E.D}} {{currentTrip.E.T}}</span><!--
        --><button v-on:click="currentTrip.Shift(1)" class="period__up">&gt;</button>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';

    @Component
    export default class Period extends Vue {
        @Prop() private currentTrip!: any;
    }
</script>

<style lang="scss">
    .period {
        margin-bottom: 1em;
        white-space: nowrap;

        &__date {
            padding: 0 4px;
        }

        &__up,
        &__down {
            position: relative;
            width: 24px;
            height: 24px;
            border: 0;
            padding: 0;
            background: none;

            &:before {
                content: '';
                position: absolute;
                top: 7px;
                left: 7px;
                border-top: 5px solid transparent;
                border-bottom: 5px solid transparent;
            }
        }

        &__up:before {
            border-left: 10px solid currentColor;
        }

        &__down:before {
            border-right: 10px solid currentColor;
        }
    }
</style>
