<template>
    <div v-bind:class="{'car-state': true, 'car-state--on': status == 1, 'car-state--off': status != 1}">
        Состояние: <span class="car-state__value">{{ status == 1 ? 'включено' : 'выключено' }}</span>,
        <button @click="changeState" class="car-state__control">{{ status == 1 ? 'выключить' : 'включить' }}</button>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { connector, $bus } from '../main';
    import { IEnumDeviceItem, DeviceCommandType, DCStatus } from '../assets/ts/ServiceConnector';

    @Component
    export default class CarState extends Vue {
        @Prop() private currentCar!: IEnumDeviceItem;
        @Prop() private status!: DCStatus;

        private readonly commandName = 'GET';

        private mounted(): void {

        }

        private changeState(): void {
            connector.SendCommand([this.currentCar.ID], this.commandName).then((r: string[]) => {
                $bus.$emit('ChangeCarState', this.status != DCStatus.OK);
            });
        }
    }
</script>

<style lang="scss">
    .car-state {
        margin-bottom: 1em;

        &--on &__control {
            background: #47bb00;
        }

        &--off &__control {
            background: #d84d4d;
        }

        &__control {
            border: 0;
            outline: 0;
            line-height: 20px;
        }
    }
</style>
