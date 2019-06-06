<template>
    <div class="journal">
        <div class="journal__wrap">
            <template v-if="log.length > 0">
                <table class="journal__table table">
                    <thead>
                        <tr>
                            <th v-if="currentCar == null">ТС</th>
                            <th>Команда &nbsp;</th>
                            <th>Дата</th>
                            <th>Ответ</th>
                            <th>
                                <div class="journal__control">
                                    <span class="journal__control-caption">Статус</span>
                                    <button @click="refresh()" class="journal__refresh"><i class="icon-reload"></i></button>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in log">
                            <td v-if="currentCar == null">{{ cars[item.IDCAR].Name }}<br /><small>№{{ item.Serial }}</small></td>
                            <td v-if="item.Arguments.indexOf('1') == -1">off</td>
                            <td v-else>on</td>
                            <td>{{ item.DT }}</td>
                            <td>{{ item.ResponseDT }}</td>
                            <td v-if="item.Status == 0">InProgress</td>
                            <td v-if="item.Status == 1">OK</td>
                            <td v-if="item.Status == 2">Failed</td>
                            <td v-if="item.Status == 3">Timeout</td>
                        </tr>
                    </tbody>
                </table>
            </template>
            <template v-else>
                <div class="alert alert-primary" role="alert">
                    Нет записей
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { connector, $bus } from '../main';
    import { IEnumDeviceItem, ICommandResultItem, DeviceCommandType } from '../assets/ts/ServiceConnector';
    import { getDT } from '../assets/ts/Extenders';
    import moment from 'moment';

    @Component
    export default class Journal extends Vue {
        @Prop() private currentCar!: IEnumDeviceItem | null;
        @Prop() private cars!: any;
        @Prop() private commandName!: string;

        private readonly historyPeriodDays = 7;

        private log: ICommandResultItem[] = [];

        private mounted(): void {
            $bus.$on('RefreshCommandsLog', () => {
                const sd = moment().startOf('day').add(-this.historyPeriodDays, 'day').toDate();
                const ed = moment().toDate();

                this.log = [];

                connector.GetCommandLog(sd, ed).then((r: ICommandResultItem[]) => {
                    const log: ICommandResultItem[] = r.filter((i: ICommandResultItem) => i.Name == this.commandName);

                    log.reverse();

                    $bus.$emit('ResultCommandsLog', log);

                    if (this.currentCar == null) {
                        this.log = log;
                    } else {
                        log.forEach((item: ICommandResultItem) => {
                            if (this.currentCar != null && this.currentCar.ID == item.IDCAR) {
                                this.log.push(item);
                            }
                        });
                    }

                    this.log.forEach((item: ICommandResultItem) => {
                        const dt = getDT(item.DT, true);
                        item.DT = dt.D + ' ' + dt.T;

                        if (item.ResponseDT) {
                            const responseDT = getDT(item.ResponseDT, true);
                            item.ResponseDT = responseDT.D + ' ' + responseDT.T;
                        }
                    });

                    // --- set height

                    if (this.log.length > 0) {
                        const footer: HTMLElement = document.querySelector('.footer') as HTMLElement;
                        const wrap: HTMLElement = document.querySelector('.journal__wrap') as HTMLElement;
                        const pos: ClientRect = wrap.getBoundingClientRect() as ClientRect;

                        wrap.style.height = (window.innerHeight - pos.top - footer.clientHeight) + 'px';
                    }
                });
            });

            this.$watch('currentCar', () => this.refresh());
        }

        private refresh(): void {
            $bus.$emit('RefreshCommandsLog');
        }
    }
</script>

<style lang="scss">
    .journal {
        &__wrap {
            margin: 0 -.5em;
            overflow: auto;

            .alert {
                margin: 0 .5em;
            }
        }

        table#{&}__table {
            th,
            td {
                &:first-child {
                    padding-left: .5em;
                }

                &:last-child {
                    padding-right: .5em;
                }
            }

            th {
                vertical-align: middle;
                white-space: nowrap;
            }
        }

        &__control {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;

            &-caption {
                flex: 1;
            }
        }

        &__refresh {
            border: 0;
            padding: .25em .3em;
            line-height: 1;
            background: none;
        }
    }
</style>
