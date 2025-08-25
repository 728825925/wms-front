<template>
  <div class="layout-root">
    <!-- 侧边栏 -->
    <aside :class="['layout-sider', { collapsed: sidebarCollapsed }]">
      <div class="sider-logo">
        <img src="@/assets/png-icon/logo.png" alt="logo" class="logo-img" />
        <span v-if="!sidebarCollapsed">仓储管理系统</span>
      </div>
      <el-menu :default-active="activeMenu" :collapse="sidebarCollapsed" class="sider-menu" router>
        <template v-for="menu in menuList" :key="menu.path">
          <!-- 没有子菜单 -->
          <el-menu-item v-if="!menu.children || menu.children.length === 0" :index="menu.path">
            <el-icon v-if="menu.icon">
              <Icon :icon="menu.icon" />
            </el-icon>
            <span>{{ menu.title }}</span>
          </el-menu-item>

          <!-- 有子菜单 -->
          <el-sub-menu v-else :index="menu.path">
            <template #title>
              <el-icon v-if="menu.icon">
                <Icon :icon="menu.icon" />
              </el-icon>
              <span>{{ menu.title }}</span>
            </template>
            <el-menu-item v-for="child in menu.children" :key="child.path" :index="child.path">
              <el-icon v-if="child.icon">
                <Icon :icon="child.icon" />
              </el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </aside>

    <div class="layout-main">
      <!-- 顶部栏 -->
      <header class="layout-header">
        <div class="header-left">
          <el-tooltip :content="sidebarCollapsed ? '展开菜单' : '收起菜单'" placement="bottom">
            <el-button class="sider-trigger" size="default" @click="toggleSidebar">
              <MenuLeft v-if="!sidebarCollapsed" class="menu-toggle-icon fade-toggle" />
              <MenuRight v-else class="menu-toggle-icon fade-toggle" />
            </el-button>
          </el-tooltip>
          <el-breadcrumb separator="/" class="header-breadcrumb">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <!-- header 右侧 -->
        <div class="header-right antdpro-header-right">
          <el-tooltip :content="isFullscreen ? '恢复' : '全屏'" placement="bottom">
            <ProButton
              class="fullscreen-btn"
              type="noborder"
              :icon="isFullscreen ? 'gridicons:fullscreen-exit' : 'tdesign:fullscreen-2'"
              @click="toggleFullScreen"
              :title="isFullscreen ? '恢复' : '全屏'"
            />
          </el-tooltip>
          <el-dropdown trigger="click" @command="handleUserDropdown">
          <ProButton
            class="pro-btn-icon"
            type="noborder"
            icon="teenyicons:user-circle-outline"
            style="padding: 0 20px; min-width: 0; font-weight: bold"
            @click.stop.prevent
          >
            <span style="margin-left: 8px; font-weight: bold">{{ userRealName }}</span>
          </ProButton>
          <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="center">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 标签页 -->
      <div class="layout-tabs" style="position: relative">
        <el-tabs
          v-model="activeTab"
          type="card"
          @tab-click="onTabClick"
          @tab-remove="onTabRemove"
          class="antpro-tabs"
        >
          <el-tab-pane
            v-for="(tab, idx) in tabs"
            :key="tab.path"
            :name="tab.path"
            :closable="false"
          >
            <template #label>
              <el-icon v-if="tab.icon" style="vertical-align: middle; margin-right: 6px">
                <Icon :icon="tab.icon" />
              </el-icon>
              <span>{{ tab.title }}</span>
              <el-icon
                v-if="idx !== 0"
                class="el-icon-close"
                style="margin-left: 8px; cursor: pointer"
                @click.stop="onTabRemove(tab.path)"
              >
                <Close />
              </el-icon>
            </template>
          </el-tab-pane>
        </el-tabs>
        <!-- tabs右侧操作栏 -->
        <div class="tabs-extra-ops">
          <ProButton
            type="noborder"
            icon="ep:refresh"
            @click="handleTabRefresh"
            title="刷新当前标签页"
          />
          <el-tooltip :content="isFullscreen ? '恢复' : '全屏'" placement="bottom">
            <ProButton
              class="fullscreen-btn"
              type="noborder"
              :icon="isFullscreen ? 'gridicons:fullscreen-exit' : 'tdesign:fullscreen-2'"
              @click="toggleContentFullScreen"
              :title="isFullscreen ? '恢复' : '全屏'"
            />
          </el-tooltip>
        </div>
      </div>

      <!-- 内容区 -->
      <main class="layout-content">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </main>
      <!-- 底部栏 -->
      <footer class="layout-footer">Copyright MIT © 2025 yuetao</footer>
    </div>
  </div>
</template>

<script>
import { IconHome, IconUser, IconSettings } from '../components/icons'
import { useAuthStore } from '../stores/auth'
import { logoutApi } from '../api'
import { useApi } from '@/hooks/useApi'
import MenuLeft from '@/assets/svg-icon/menuleft.svg?component'
import MenuRight from '@/assets/svg-icon/menuright.svg?component'
import { useMenuStore } from '@/stores/menu'
import { Icon } from '@iconify/vue'
import { Close, User } from '@element-plus/icons-vue'
import ProButton from '@/components/ProButton.vue'
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'

export default {
  name: 'DefaultLayout',
  components: {
    IconHome,
    IconUser,
    IconSettings,
    MenuLeft,
    MenuRight,
    Icon,
    Close,
    User,
    ProButton,
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
  },
  data() {
    return {
      sidebarCollapsed: false,
      logoutApiHook: null,
      tabs: [], // 初始化为空
      activeTab: '/',
      tabRefreshKey: 0, // 用于刷新当前标签页组件
      isFullscreen: false,
    }
  },
  created() {
    this.logoutApiHook = useApi(logoutApi)
    // 等待菜单加载完成后添加首页tab
  },
  watch: {
    $route(to) {
      this.addTab(to)
    },
    // 监听menuList变化，修正首页tab的icon
    menuList: {
      handler(newMenuList) {
        if (!newMenuList || newMenuList.length === 0) return

        const menuStore = useMenuStore()
        const homePath = menuStore.homeRoute
        const homeMenu = newMenuList.find((menu) => menu.path === homePath) || newMenuList[0]

        // 只在完全没有任何标签时初始化首页标签
        if (this.tabs.length === 0) {
          this.tabs.push({
            title: homeMenu.title,
            path: homePath,
            icon: homeMenu?.icon || 'mdi:monitor-dashboard',
            closable: false,
          })
          this.activeTab = homePath
        }
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    activeMenu() {
      return this.$route.path
    },
    menuList() {
      const menuStore = useMenuStore()
      return menuStore.menuList || []
    },
    homePath() {
      const menuStore = useMenuStore()
      return menuStore.homeRoute.path
    },
    breadcrumbs() {
      const matched = this.$route.matched.filter((item) => item.meta && item.meta.title)
      return matched.map((item) => ({
        title: item.meta.title,
        path: item.path,
      }))
    },
    userRealName() {
      const authStore = useAuthStore()
      return authStore.userInfo?.realName || '未登录'
    },
  },
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    async handleLogout() {
      const authStore = useAuthStore()
      // 先调用 authStore.logout() 重置状态
      authStore.logout()
      // 再调用 API 登出
      // await this.logoutApiHook.run()
      this.$router.replace('/login') // ✅ 使用 router 跳转
    },
    handleRefresh() {
      window.location.reload()
    },
    toggleFullScreen() {
      if (!this.isFullscreen) {
        document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },
    toggleContentFullScreen() {
      const content = this.$el.querySelector('.layout-content')
      if (content) {
        if (!document.fullscreenElement) {
          content.requestFullscreen()
        } else {
          document.exitFullscreen()
        }
      }
    },
    handleUserCenter() {
      this.$router.push('/user-center')
    },
    handleSettings() {
      this.$router.push('/settings')
    },
    addTab(route) {
      const path = route.path
      // 特殊处理首页路由
      if (path === this.homePath) {
        const homeTab = this.tabs.find((tab) => tab.path.path === this.homePath)
        if (homeTab) {
          this.activeTab = this.homePath
          return
        }
      }
      // 普通路由处理
      if (this.tabs.some((tab) => tab.path === path)) {
        this.activeTab = path
        return
      }

      const icon = this.findIconInMenu(this.menuList, path)

      this.tabs.push({
        title: route.meta?.title || route.name || path,
        path,
        icon,
        closable: path !== this.homePath, // 首页不可关闭
      })

      this.activeTab = path
    },

    // 提取为工具方法
    findIconInMenu(menus, path) {
      for (const m of menus) {
        if (m.path === path) return m.icon || ''
        if (m.children) {
          const found = this.findIconInMenu(m.children, path)
          if (found) return found
        }
      }
      return ''
    },
    onTabClick(tab) {
      this.$router.push(tab.paneName)
    },
    onTabRemove(targetName) {
      const tabs = this.tabs
      let newActiveTab = this.activeTab
      if (newActiveTab === targetName) {
        const idx = tabs.findIndex((tab) => tab.path === targetName)
        if (idx > 0) {
          newActiveTab = tabs[idx - 1].path
        } else if (tabs.length > 1) {
          newActiveTab = tabs[1].path
        } else {
          newActiveTab = this.homePath
        }
      }
      this.tabs = tabs.filter((tab) => tab.path !== targetName)
      this.activeTab = newActiveTab
      if (this.$route.path !== newActiveTab) {
        this.$router.push(newActiveTab)
      }
    },
    handleTabRefresh() {
      this.tabRefreshKey = Date.now() // 或用 uuid
    },
    onFullscreenChange() {
      this.isFullscreen = !!document.fullscreenElement
    },
    handleUserDropdown(cmd) {
      if (cmd === 'logout') {
        this.handleLogout()
      } else if (cmd === 'center') {
        this.handleUserCenter()
      }
    },
  },
  mounted() {
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
  },
  beforeUnmount() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange)
  },
}
</script>

<style scoped>
/* 保留布局和结构相关样式，移除菜单项高亮、阴影、圆角等样式 */
.layout-root {
  display: flex;
  height: 100vh;
  background: #f5f6fa;
}

.layout-sider {
  width: 220px !important;
  min-width: 220px !important;
  background: #fff;
  border-right: none;
  z-index: 110;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 32px 0 rgba(0, 0, 0, 0.1);
}

.sider-logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: bold;
  font-size: 18px;
  color: #636cff;
  background: #fff;
  padding-left: 18px;
}
.sider-logo span {
  color: #636cff;
}
.logo-img {
  height: 40px;
  margin-right: 8px;
  margin-left: 0;
}

.sider-menu {
  flex: 1;
  border: none;
  background: transparent;
  padding-top: 0;
  padding-bottom: 0;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
  background: #f8fafc;
}

.layout-header,
.layout-footer,
.layout-tabs,
.content-card {
  background: #fff;
}

.layout-header,
.layout-footer,
.layout-tabs {
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.03);
}

.layout-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.03);
  z-index: 10;
}
.header-left {
  display: flex;
  align-items: center;
}
.sider-trigger {
  margin-right: 16px;
  border: none;
  box-shadow: none;
  padding: 0;
  width: 50px;
  height: 36px;
  min-width: 50px;
  min-height: 36px;
  max-width: 50px;
  max-height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.sider-trigger:hover {
  background: #e4e7ed;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}
.menu-toggle-icon {
  width: 16px;
  height: 16px;
  display: block;
  opacity: 1;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-toggle {
  opacity: 1;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.menu-toggle-icon[style*='display: none'] {
  opacity: 0;
}
.layout-tabs {
  margin-bottom: 0;
  /* padding: 24px 0px; */
  min-height: 42px;
}

.layout-content {
  flex: 1;
  min-height: 0;
  height: 100%;
  padding: 16px;
  background: #f8fafc;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px; /* 卡片间距 */
  backdrop-filter: none !important;
}

.content-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.06), 0 1.5px 4px 0 rgba(0, 0, 0, 0.04);
  padding: 24px;
  font-size: 16px;
  color: #222;
}
.layout-footer {
  height: 44px;
  background: #fff;
  color: #888;
  font-size: 14px;
  text-align: center;
  line-height: 44px;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
  letter-spacing: 1px;
  box-shadow: 0 -2px 8px 0 rgba(0, 0, 0, 0.04);
}

/* 收缩状态下的侧边栏宽度 */
.layout-sider.collapsed {
  width: 64px !important;
  min-width: 64px !important;
}

/* 收缩时菜单项和子菜单标题居中 */
.layout-sider.collapsed .el-menu-item,
.layout-sider.collapsed .el-sub-menu__title {
  justify-content: center !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* 收缩时icon更大且居中 */
.layout-sider.collapsed .el-icon,
.sider-menu .el-icon {
  font-size: 24px !important;
  width: 20px !important;
  height: 20px !important;
  margin-right: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: black;
}

/* 只显示icon，隐藏其它内容，适配 collapse 状态 */
:deep(.el-menu--collapse .el-menu-item > *:not(.el-icon)),
:deep(.el-menu--collapse .el-sub-menu__title > *:not(.el-icon)) {
  display: none !important;
}

body {
  background: #f8fafc;
  font-family: '微软雅黑', 'Microsoft YaHei', Arial, sans-serif;
}

.menu-icon {
  font-size: 20px;
  color: #888;
  vertical-align: middle;
  margin-right: 12px !important;
}

/* 默认图标和文字黑色 */
.menu-icon,
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: #222 !important;
}

/* 展开状态下菜单名距离icon 10px */
.sider-menu:not(.el-menu--collapse) .el-menu-item span,
.sider-menu:not(.el-menu--collapse) .el-sub-menu__title span {
  margin-left: 10px;
}

:deep(.layout-sider.collapsed .el-sub-menu__title) {
  justify-content: center !important;
  position: static !important;
  width: 100% !important;
  text-align: center !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.layout-sider.collapsed .el-sub-menu__icon-arrow) {
  display: none !important;
}

.antpro-tabs {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  min-height: 42px;
  height: 42px;
  position: relative;
  /* 关键：加淡淡的阴影 */
  box-shadow: 0 2px 8px 0 rgba(60, 62, 80, 0.04);
}
:deep(.antpro-tabs .el-tabs__header),
:deep(.antpro-tabs .el-tabs__nav),
:deep(.antpro-tabs .el-tabs__nav-wrap),
:deep(.antpro-tabs .el-tabs__nav-scroll) {
  border: none !important;
  box-shadow: none !important;
  background: #fff !important;
  height: 42px;
  margin: 0 !important;
  padding: 0 !important;
}
:deep(.antpro-tabs .el-tabs__item) {
  border-radius: 10px 10px 0 0 !important;
  margin-right: 8px;
  padding: 0 22px;
  height: 42px; /* 和 .antpro-tabs 一致 */
  line-height: 42px; /* 和 .antpro-tabs 一致 */
  margin-top: 0 !important;
  font-size: 15px;
  color: #222;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: background 0.2s, color 0.2s;
}
:deep(.antpro-tabs .el-tabs__item.is-active) {
  background: #f3f4ff !important;
  color: #636cff !important;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 4px 16px 0 rgba(99, 108, 255, 0.08) !important;
  /* 不要有margin-bottom、不要有border-bottom */
}
:deep(.antpro-tabs .el-tabs__item:hover) {
  background: #f5f7fa !important; /* hover淡灰色 */
  color: #636cff !important;
}
:deep(.antpro-tabs .el-tabs__item .el-icon) {
  font-size: 18px !important;
  margin-right: 6px !important;
  color: inherit !important;
  display: flex;
  align-items: center;
}
:deep(.antpro-tabs .el-tabs__item .el-icon + span) {
  margin-left: 0 !important;
}
:deep(.antpro-tabs .el-tabs__item .el-icon),
:deep(.antpro-tabs .el-tabs__item.is-active .el-icon),
:deep(.antpro-tabs .el-tabs__item:hover .el-icon) {
  color: inherit !important;
}
:deep(.antpro-tabs .el-tabs__item:last-child) {
  margin-right: 0 !important;
}
:deep(.antpro-tabs .el-tabs__item),
:deep(.antpro-tabs .el-tabs__item.is-active) {
  border-radius: 10px 10px 0 0 !important; /* 只上圆角，下直角 */
}

.antdpro-header-right {
  display: flex;
  align-items: center;
  gap: 0; /* 或 gap: 4px; */
}
.user-info {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
  color: #222;
  margin-left: 8px;
}
.user-info .el-avatar {
  font-size: 22px;
  margin-right: 6px;
}
.tabs-extra-ops {
  position: absolute;
  right: 24px;
  top: 0;
  height: 42px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

:deep(.table-card .el-card__body) {
  flex: 1 1 0%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
}
</style>