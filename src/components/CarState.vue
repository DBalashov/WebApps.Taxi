<template>
    <div class="car-state">
        Состояние:<!--
        --><span v-if="state == 0" class="car-state__value">неизвестно</span>
        <span v-if="state == 1" class="car-state__value">включено</span>
        <span v-if="state == -1" class="car-state__value">выключено</span>
        <button v-if="state == 0 || state == 1" @click="changeState('0')" class="car-state__control car-state__control--off">выключить</button>
        <button v-if="state == 0 || state == -1" @click="changeState('1')" class="car-state__control car-state__control--on">включить</button>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { connector, $bus } from '../main';
    import { IEnumDeviceItem, DeviceCommandType, ICommandResultItem, DCStatus } from '../assets/ts/ServiceConnector';

    @Component
    export default class CarState extends Vue {
        @Prop() private currentCar!: IEnumDeviceItem;
        @Prop() private commandStatusCar!: ICommandResultItem | undefined;
        @Prop() private commandStatusOk!: DCStatus;

        private readonly commandName = 'GET'; // MOUT1

        private changeState(value: string): void {
            connector.SendCommand([this.currentCar.ID], this.commandName, [value]).then((r: string[]) => {
                $bus.$emit('ChangeCarState', value);
            });
        }

        get state(): number {
            if (this.commandStatusCar === undefined) return 0;
            if (this.commandStatusCar.Status === this.commandStatusOk && this.commandStatusCar.Arguments.includes('1')) return 1;
            if (this.commandStatusCar.Status === this.commandStatusOk && this.commandStatusCar.Arguments.includes('0')) return -1;
            return 0;
        }
    }
</script>

<style lang="scss">
    .car-state {
        margin-bottom: 1em;

        &__control {
            &--on {
                background: #b8e994;
            }

            &--off {
                background: #e55039;
            }
        }

        &__value,
        &__control {
            margin-left: .5em;
        }

        &__control {
            border: 0;
            outline: 0;
            line-height: 20px;
        }
    }
</style>
