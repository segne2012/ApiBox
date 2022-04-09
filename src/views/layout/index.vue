<template>
    <div class="layout">
        <main>
            <div class="left">
                <a-menu
                v-model:openKeys="openKeys"
                v-model:selectedKeys="selectedKeys"
                mode="inline"
                theme="dark"
                @click="handleClick"
                :inline-collapsed="collapsed"
                >
                    <a-menu-item v-for="menu in menuList" :key="menu.key">
                        <template #icon>
                        <PieChartOutlined />
                        </template>
                        <span>{{menu.title}}</span>
                    </a-menu-item>
                </a-menu>
            </div>
            <div class="right">
                <router-view ></router-view>
            </div>
        </main>
        <footer>
            <p>
                <a href="" target="_blank">Vite</a>
                is a TypeScript + Vue 3 starter template.
            </p>
        </footer>
    </div>
</template>

<script setup lang="ts">import { ref } from 'vue';
import router from '../../router';


let menuList = ref([
    {
        title: '首页',
        key: '1',
        icon: 'pie-chart',
        path: '/home/index',
    },
    {
        title: '关于',
        key: '2',
        icon: 'smile',
        path: '/home/about',
    },
    {
        title: 'login',
        key: '3',
        icon: 'smile',
        path: '/home/login',
    },
]);


let openKeys = ref([]);
let selectedKeys = ref([]);
let collapsed = false;

let handleClick = (e: any) => {
    console.log(e);
    let activemenu = menuList.value.find(el => el.key === e.key);
    console.log(activemenu.path, router);
    router.push(activemenu.path);
};
</script>

<style scoped lang="less">
.layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    main{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        .left{
            width: 200px;
            height: 100%;
            background: #2c3e50;
            overflow-y: auto;
            flex-grow: 0;
            flex-shrink: 0;
        }
        .right{
            width: calc(100% - 200px);
            height: 100%;
            overflow-y: auto;
            flex-grow: 1;
        }
    }
}
</style>