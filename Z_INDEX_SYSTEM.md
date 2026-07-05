# نظام Z-Index الموحد - Nexivo

## التسلسل الهرمي الموحد

### المستوى 0-49: المحتوى العادي
- **z-0**: المحتوى الأساسي (default)
- **z-10**: Header ثابت
- **z-20**: Sticky elements
- **z-30**: Dropdowns
- **z-40**: Popovers
- **z-50**: Toast notifications

### المستوى 100-199: Modals
- **z-100**: Modals الأساسية
- **z-150**: Dialogs
- **z-199**: Modal overlays

### المستوى 200-299: Global Portals (المحدث)
- **z-200**: ModalPortal
- **z-250**: NotificationDropdownPortal (Global Portal)
- **z-299**: SideNav overlay (Global Portal)
- **z-300**: SideNav (Global Portal)

### المستوى 1000+: عناصر خاصة
- **z-1000+**: محجوز للمستقبل (لا تستخدم)

## القواعد

1. **لا تتجاوز z-300** إلا للعناصر الخاصة جداً
2. **استخدم التسلسل المنطقي**: المحتوى < Modals < Global Portals
3. **لا تستخدم z-index عشوائي** بدون سبب واضح
4. **توحيد القيم**: استخدم نفس القيم للعناصر المتشابهة

## نظام Global Portals (الجديد)

### المبدأ
جميع القوائم والإشعارات يتم render باستخدام `createPortal` مباشرة داخل `document.body` لتجنب أي Stacking Context من الـ Header أو أي parent آخر.

### المكونات

#### GlobalPortalProvider
- **الموقع**: `src/components/GlobalPortalContainer.tsx`
- **الوظيفة**: إدارة حالة جميع Global Portals
- **يستخدم**: React Context API

#### SideNavPortal
- **الموقع**: `src/components/SideNavPortal.tsx`
- **z-index**: z-[299] (overlay), z-[300] (sidebar)
- **Portal**: `createPortal(..., document.body)`
- **السبب**: فصل القائمة عن Header تماماً

#### NotificationDropdownPortal
- **الموقع**: `src/components/NotificationDropdownPortal.tsx`
- **z-index**: z-[250]
- **Portal**: `createPortal(..., document.body)`
- **السبب**: فصل الإشعارات عن Header تماماً

#### NavNotificationBell
- **الموقع**: `src/components/NavNotificationBell.tsx`
- **الوظيفة**: الزر فقط (بدون dropdown)
- **يستخدم**: `useGlobalPortals` hook

## المكونات المحدثة

### ModalPortal
- **القيمة السابقة**: z-[100]
- **القيمة الجديدة**: z-[200]
- **السبب**: لتكون تحت Global Portals ولكن فوق المحتوى

### SideNav (القديم)
- **القيمة السابقة**: z-[1000], z-[1001]
- **الحالة**: تم استبداله بـ SideNavPortal
- **السبب**: كان يسبب مشاكل Stacking Context

### Admin Layout
- **Header**: z-10
- **Overlay**: z-40
- **Sidebar**: z-50
- **السبب**: توحيد مع نظام الموحد

### Header
- **القيمة السابقة**: z-10
- **القيمة الجديدة**: z-50
- **السبب**: ليكون فوق المحتوى العادي
- **ملاحظة**: لم يعد يحتوي على القوائم نفسها

## حل مشكلة Stacking Context

### المشكلة الأصلية
- Header يستخدم `backdrop-blur-xl` + `sticky` + `z-50`
- هذا يخلق Stacking Context جديد
- القوائم والإشعارات كانت render داخل Header
- حتى مع z-index عالي، كانت محصورة داخل Stacking Context

### الحل
1. فصل القوائم والإشعارات عن Header
2. استخدام React Portal لـ render مباشرة في `document.body`
3. إدارة الحالة عبر Global Context
4. القوائم والإشعارات الآن مستقلة تماماً عن أي parent
