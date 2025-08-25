import { defineStore } from 'pinia';
import { getCurrentUserMenu } from '@/api/index';
import router from '@/router';
import componentMap from '@/router/componentMap';

export const useMenuStore = defineStore('menu', {
  state: () => ({
    dynamicRoutes: [],   // 解析后的动态路由（仅 children）
    menuList: [],        // 原始菜单数据（后端返回）
    isMenuLoaded: false, // 标记是否已加载路由
    homeRoute: null,     // 首页路由对象
  }),

  actions: {
    /**
     * 初始化动态路由（优先从Pinia恢复，失败则请求后端）
     */
    async initDynamicRoutes() {
      this.isMenuLoaded = false
      
      if (this.isMenuLoaded && this.dynamicRoutes.length > 0) {
        return;
      }
      try {
        if (this.menuList.length === 0) {
          const { data } = await getCurrentUserMenu();

          if (!data || !Array.isArray(data.routes)) {
            throw new Error('后端返回数据格式错误：缺少 routes 字段');
          }

          await this.addDynamicRoutes(data.routes, data.homeRouteName);
        } else {
          this.rebuildAppRoute();
          this.addNotFoundRoute();
        }
      } catch (error) {
        console.error('[MenuStore] 动态路由初始化失败:', error);
      }
    },

    /**
     * 动态添加路由并注入到 '/' 路由的 children 中
     * @param {Array} routes 后端返回的路由配置
     * @param {String} homeRouteName 后端指定的首页路由名称
     */
    async addDynamicRoutes(routes, homeRouteName) {
      // 保存原始菜单数据（持久化）
      this.menuList = routes;

      // 解析成路由对象
      const resolvedRoutes = this.resolveRoutes(routes);

      // 设置首页
      if (homeRouteName) {
        this.homeRoute = resolvedRoutes.find(route => route.name === homeRouteName) || null;
        if (!this.homeRoute) {
          console.warn(`[MenuStore] 指定的首页路由 "${homeRouteName}" 未找到`);
        }
      } else {
        this.homeRoute = resolvedRoutes[0] || null;
      }
      // 注入到 app 路由下
      const appRoute = {
        path: '/',
        name: 'app',
        component: () => import('@/layouts/DefaultLayout.vue'),
        children: resolvedRoutes,
      };
      router.addRoute(appRoute);

      // 添加 404
      this.addNotFoundRoute();

      // 更新状态
      this.dynamicRoutes = resolvedRoutes;
      this.isMenuLoaded = true;

    },

    /**
     * 从持久化恢复动态路由
     */
    rebuildAppRoute() {
      if (this.menuList.length === 0) return;

      const resolvedRoutes = this.resolveRoutes(this.menuList);

      const appRoute = {
        path: '/',
        name: 'app',
        component: () => import('@/layouts/DefaultLayout.vue'),
        children: resolvedRoutes,
      };

      router.addRoute(appRoute);

      this.dynamicRoutes = resolvedRoutes;
      this.isMenuLoaded = true;

    },

    /**
     * 添加 404 路由（避免重复）
     */
    addNotFoundRoute() {
      if (!router.hasRoute('NotFound')) {
        router.addRoute({
          path: '/:pathMatch(.*)*',
          name: 'NotFound',
          component: componentMap['NotFoundView'],
          meta: { layout: 'DefaultLayout', hidden: true },
        });
      }
    },

    /**
     * 解析路由配置（处理组件映射和布局）
     */
    resolveRoutes(routes) {
      return routes.map(route => {
        try {
          const resolvedRoute = {
            path: route.path,
            name: route.name,
            meta: {
              title: route.meta?.title,
              icon: route.meta?.icon,
              perms: route.meta?.perms,
              layout: route.layout || 'DefaultLayout',
              ...route.meta,
            },
            children: route.children ? this.resolveRoutes(route.children) : undefined,
          };

          if (route.component) {
            if (route.component.startsWith('layout:')) {
              const layoutName = route.component.split(':')[1];
              resolvedRoute.component =
                componentMap[`layout:${layoutName}`] || componentMap['layout:DefaultLayout'];
            } else {
              resolvedRoute.component =
                componentMap[route.component] || componentMap['NotFoundView'];
            }
          } else if (route.children?.length > 0) {
            resolvedRoute.component = componentMap['layout:MenuLayout'];
            resolvedRoute.redirect = { name: route.children[0].name };
          } else {
            resolvedRoute.component = componentMap['NotFoundView'];
          }

          return resolvedRoute;
        } catch (err) {
          console.error(`[MenuStore] 路由解析失败: ${route.path}`, err);
          return {
            path: `/error-${route.path.replace(/\//g, '-')}`,
            component: componentMap['NotFoundView'],
            meta: { hidden: true },
          };
        }
      });
    },

    /**
     * 重置路由和菜单（退出登录）
     */
    resetRoutes() {
      this.dynamicRoutes.forEach(route => {
        if (router.hasRoute(route.name)) {
          router.removeRoute(route.name);
        }
      });

      if (router.hasRoute('app')) {
        router.removeRoute('app');
      }

      router.addRoute({
        path: '/',
        name: 'app',
        component: () => import('@/layouts/DefaultLayout.vue'),
        children: []
      });

      if (router.hasRoute('NotFound')) {
        router.removeRoute('NotFound');
      }

      this.dynamicRoutes = [];
      this.menuList = [];
      this.homeRoute = null;
      this.isMenuLoaded = false;

    },

    /**
     * 获取扁平化菜单
     */
    flatMenuList() {
      const result = [];
      const flatten = (menus) => {
        menus.forEach(menu => {
          if (!menu.meta?.hidden) {
            result.push(menu);
            if (menu.children?.length) {
              flatten(menu.children);
            }
          }
        });
      };
      flatten(this.menuList);
      return result;
    },
  },

  // 持久化配置
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'menu-store',
        storage: localStorage,
        paths: ['menuList', 'homeRoute'], // ⚠️ 不要存 dynamicRoutes
      },
    ],
  },
});
