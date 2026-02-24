"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { usePathname } from "next/navigation";
import Link from "next/link";

const getSafeMarkdownHref = (href) => {
    if(typeof href !== "string") {
        return null;
    }

    if(href.startsWith("/") || href.startsWith("#")) {
        return href;
    }

    try {
        const parsed = new URL(href);
        if(!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
            return null;
        }

        return parsed.toString();
    } catch {
        return null;
    }
};

const contentRulesEN = `
# Terms of Use

**Last modified: October 10, 2025**

## Acceptance of the Terms of Use

These Terms of Use govern your access to and use of \`modifold.com\` and \`api.modifold.com\` (the "Service"), including any content, functionality, and services offered, whether as a guest or registered user.

By accessing or using the Service, you accept and agree to be bound by these Terms of Use and our [Privacy Policy](/legal/privacy). If you do not agree, you must not access or use the Service.

The Service is offered to users who are 13 years of age or older. By using the Service, you represent and warrant that you are of legal age to form a binding contract and meet all eligibility requirements. If you do not meet these requirements, you must not access or use the Service.

## Changes to the Terms of Use

We may revise and update these Terms of Use at our sole discretion. All changes are effective immediately upon posting and apply to all access and use of the Service thereafter. Your continued use of the Service after changes means you accept and agree to them. You are expected to check this page periodically for updates, as they are binding on you.

## Accessing the Service and Account Security

We reserve the right to withdraw or amend the Service, or any material provided through it, at our sole discretion without notice. We are not liable if any part of the Service is unavailable at any time.

You are responsible for:
- Making all arrangements necessary to access the Service.
- Ensuring that all persons accessing the Service through your internet connection are aware of and comply with these Terms of Use.

To access certain resources, you may need to provide registration details. You agree that all information you provide is correct, current, and complete, and is governed by our [Privacy Policy](/legal/privacy). You consent to all actions we take with your information consistent with our Privacy Policy.

If you choose or are provided with an email, password, or other security information, you must:
- Treat such information as confidential and not disclose it.
- Not provide any other person access to the Service using your credentials.
- Notify us immediately of any unauthorized access or security breach at [support@modifold.com](mailto:support@modifold.com).

We may disable any username, password, or identifier at our discretion, including if you violate these Terms of Use.

## About the Service

The Service allows you to upload and share your gaming content (e.g., mods, resource packs, shaders, data packs; "Gaming Content") with other users. Unlike user comments or posts, we do not claim any ownership of your Gaming Content. You are solely responsible for any claims, actions, or damages related to your Gaming Content.

By uploading Gaming Content, you grant us a limited, non-exclusive, royalty-free, fully paid-up right to display and distribute it to users through the Service, who may use it at their discretion. If you delete your Gaming Content, it may remain in use by users who previously downloaded it or included it in modpacks until they remove it. You retain all ownership rights in your Gaming Content.

All Gaming Content must comply with our [Content Rules](#content-rules).

## API Usage

The Service provides an Application Programming Interface (API) at \`api.modifold.com\`, allowing users to interact with the Service via their own websites or applications.

We grant you a limited, non-exclusive, non-sublicensable, and revocable license to use the API to download, display, query, create, edit, or delete Gaming Content, provided you:
- Use the API in accordance with these Terms, our [Content Rules](#content-rules), and applicable laws.
- Do not infringe third-party rights.
- Assist us in complying with applicable laws and regulations.

You agree to indemnify and hold us harmless from any claims, proceedings, or actions arising from your use of the API.

## Intellectual Property Rights

Except for Gaming Content, the Service and its contents, features, and functionality (e.g., software, text, images, design) are owned by us or our licensors and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property laws.

These Terms of Use permit personal, non-commercial use only. No right, title, or interest in the Service is transferred to you, and all rights not expressly granted are reserved.

## Trademarks

The Modifold name, logo, and related designs are our trademarks. You must not use them without prior written permission. Other names, logos, or designs on the Service are the trademarks of their respective owners.

## Prohibited Uses

You may use the Service only for lawful purposes and in accordance with these Terms of Use. You agree not to:
- Violate any applicable federal, state, local, or international law or regulation.
- Exploit or harm minors by exposing them to inappropriate content or requesting personal information.
- Upload or use material that does not comply with our [Content Rules](#content-rules).
- Send or procure advertising, "spam," or similar solicitations.
- Impersonate us, our employees, or other users.
- Engage in conduct that restricts or inhibits others’ use or enjoyment of the Service or may harm us or users.

Additionally, you agree not to:
- Use any robot, spider, or automatic device to access the Service without permission.
- Use any device, software, or routine that interferes with the Service’s operation.
- Introduce viruses, trojan horses, or other harmful material.
- Attempt unauthorized access, interference, or disruption of the Service or its servers.
- Attack the Service via denial-of-service or distributed denial-of-service attacks.

## User Contributions

The Service may include interactive features (e.g., profiles, posts, comments; "Interactive Services") that allow users to submit content (other than Gaming Content; "User Contributions").

All User Contributions and use of Interactive Services must comply with our [Content Rules](#content-rules).

By posting User Contributions, you grant us and our service providers a non-exclusive, royalty-free right to use, reproduce, modify, display, and distribute them for purposes consistent with your account settings. You represent and warrant that:
- You own or control all rights to your User Contributions.
- Your User Contributions comply with these Terms of Use.

You are responsible for your User Contributions’ legality, reliability, and appropriateness. We are not liable for the content or accuracy of User Contributions.

## Content Rules

All Gaming Content and User Contributions must:
- Be accurate and not misleading.
- Not violate any third-party intellectual property rights.
- Not contain unlawful, offensive, abusive, defamatory, or obscene material.
- Not contain viruses or other harmful code.
- Comply with all applicable laws and regulations.

We may remove or refuse any content that violates these rules at our discretion.

## Monitoring and Enforcement; Termination

We may:
- Remove or refuse User Contributions at our discretion.
- Take action against User Contributions that violate these Terms of Use, including those that infringe rights, threaten safety, or create liability.
- Take legal action or refer illegal use to law enforcement.
- Terminate or suspend your access for any reason, including violations of these Terms.

We may cooperate with law enforcement or court orders to disclose user information. You waive and hold us harmless from claims resulting from such actions.

We are not liable for any failure to remove objectionable material promptly and assume no responsibility for user-provided content.

## Copyright Infringement

If you believe any User Contributions violate your copyright, please contact us at [support@modifold.com](mailto:support@modifold.com) for instructions on submitting a notice. We may terminate accounts of repeat infringers.

## Reliance on Information Posted

Information on the Service is for general purposes only. We do not warrant its accuracy, completeness, or usefulness. Any reliance on such information is at your own risk. We disclaim liability for reliance by you or others.

Third-party content (e.g., user posts) reflects the opinions of its providers, not us. We are not liable for its content or accuracy.

## Changes to the Service

We may update the Service’s content periodically, but it may not always be complete or up-to-date. We are not obligated to update any material.

## Linking to the Service and Social Media Features

You may link to our website if it is fair, legal, and does not damage our reputation or suggest unauthorized association or endorsement. The Service may include social media features to:
- Link to content.
- Send communications with content or links.
- Display limited content on your or third-party websites.

You must use these features as provided and in accordance with any additional terms. You must not:
- Frame or deep-link the Service without permission.
- Take actions inconsistent with these Terms.

We may disable social media features or links at our discretion.

## Links from the Service

Links to third-party sites are for convenience only. We have no control over their content and accept no responsibility for any loss or damage from their use. You access them at your own risk.

## Geographic Restrictions

Access to the Service may not be legal in certain countries. If you access it from outside, you are responsible for compliance with local laws.

## Disclaimer of Warranties

We do not guarantee that files downloaded from the Service are free of viruses or harmful code. You are responsible for implementing anti-virus protection and data recovery measures.

The Service and its content are provided "as is" and "as available," without warranties of any kind, express or implied, including completeness, security, reliability, or availability. We disclaim all warranties, including merchantability, non-infringement, and fitness for a particular purpose, to the extent permitted by law.

## Limitation on Liability

We, our affiliates, licensors, or service providers are not liable for any damages arising from your use or inability to use the Service, including direct, indirect, special, incidental, consequential, or punitive damages, even if foreseeable.

Our total liability for any claim is limited to the amount you paid us (if any) in the three months prior to the claim, to the extent permitted by law.

## Indemnification

You agree to defend, indemnify, and hold us harmless from any claims, liabilities, damages, or costs (including attorneys’ fees) arising from your violation of these Terms or use of the Service, including your User Contributions.

## Governing Law and Jurisdiction

These Terms of Use and any disputes are governed by the laws of the State of Delaware, USA, without regard to conflict of law provisions. Any legal action shall be brought exclusively in Delaware’s federal or state courts, though we may pursue actions in your country of residence or elsewhere. You waive objections to jurisdiction or venue in such courts.

## Arbitration

At our discretion, disputes arising from these Terms or the Service may be submitted to final and binding arbitration under the Rules of Arbitration of the American Arbitration Association, applying Delaware law.

## Limitation on Time to File Claims

Any claim arising from these Terms or the Service must be filed within one year after the cause of action accrues, or it is permanently barred.

## Waiver and Severability

No waiver of any term is a continuing waiver, and failure to assert a right does not waive it. If any provision is held invalid or unenforceable, it will be limited to the minimum extent, and the remaining provisions will remain in effect.

## Entire Agreement

These Terms of Use and our [Privacy Policy](/legal/privacy) constitute the entire agreement between you and us regarding the Service, superseding all prior agreements.

## Your Comments and Concerns

For feedback, support, or other communications, contact us at [support@modifold.com](mailto:support@modifold.com).
`;

const contentRulesRU = `
# Условия использования

**Последнее изменение: 10 января 2026**

## Принятие Условий использования

Настоящие Условия использования регулируют ваш доступ и использование сайтов \`modifold.com\` и \`api.modifold.com\` (далее совместно — «Сервис»), включая любой контент, функциональность и услуги, предлагаемые на Сервисе, независимо от того, используете ли вы его как гость или зарегистрированный пользователь.

Используя или заходя на Сервис, вы подтверждаете, что принимаете и соглашаетесь соблюдать настоящие Условия использования, а также нашу [Политику конфиденциальности](/legal/privacy). Если вы не согласны с этими условиями — вы не имеете права использовать Сервис.

Сервис предназначен для лиц старше 13 лет. Используя Сервис, вы заявляете и гарантируете, что достигли возраста, позволяющего заключать юридически обязывающие договоры, и соответствуете всем требованиям для использования Сервиса. Если вы не соответствуете этим требованиям — вы не можете использовать Сервис.

## Изменения Условий использования

Мы вправе в любое время по своему усмотрению изменять и обновлять настоящие Условия. Все изменения вступают в силу немедленно после публикации и применяются ко всему последующему использованию Сервиса. Продолжение использования Сервиса после внесения изменений означает, что вы приняли и согласны с ними. Рекомендуем периодически проверять эту страницу, так как изменения обязательны для вас.

## Доступ к Сервису и безопасность аккаунта

Мы оставляем за собой право в любое время и без уведомления снять, изменить или ограничить доступность Сервиса или любой его части. Мы не несем ответственности, если Сервис (или его часть) окажется недоступен в какое-либо время.

Вы несёте ответственность за:
- Создание всех необходимых условий для доступа к Сервису (включая интернет-соединение, устройство и т.д.);
- Обеспечение того, чтобы все лица, использующие интернет-соединение вашего устройства, знали и соблюдали настоящие Условия.

Для доступа к некоторым функциям может потребоваться регистрация. Вы гарантируете, что вся предоставляемая вами информация является точной, актуальной и полной. Все данные обрабатываются в соответствии с нашей [Политикой конфиденциальности](/legal/privacy).

Если вы получаете логин, пароль или другие данные для входа, вы обязаны:
- Считать их конфиденциальными и не разглашать;
- Не передавать доступ к вашему аккаунту третьим лицам;
- Немедленно сообщать нам о любом несанкционированном доступе или подозрении на утечку по адресу [support@modifold.com](mailto:support@modifold.com).

Мы вправе в любое время отключить ваш логин, пароль или аккаунт, в том числе при нарушении вами настоящих Условий.

## О Сервисе

Сервис позволяет загружать и делиться вашим игровым контентом (моды, ресурспаки, шейдеры, дата-паки и т.п. для **Hytale** — далее «Игровой контент») с другими пользователями.

Мы **не претендуем** на право собственности на ваш Игровой контент. Вы несёте полную ответственность за любые претензии, иски и убытки, связанные с вашим Игровым контентом.

Загружая Игровой контент, вы предоставляете нам ограниченное, неисключительное, безвозмездное, полностью оплаченное право на показ и распространение этого контента через Сервис. Пользователи, скачавшие ваш контент, могут использовать его по своему усмотрению. При удалении вами контента он может продолжать использоваться теми, кто уже скачал его или включил в сборки, до тех пор, пока они сами его не удалят. Вы сохраняете все права собственности на свой Игровой контент.

Весь Игровой контент обязан соответствовать нашим [Правилам контента](/legal/rules).

## Использование API

Сервис предоставляет API по адресу \`api.modifold.com\`, позволяющий взаимодействовать с Сервисом через собственные сайты и приложения.

Мы предоставляем вам ограниченную, неисключительную, несублицензируемую и отзывную лицензию на использование API для скачивания, отображения, запроса, создания, редактирования или удаления Игрового контента при условии, что вы:
- Используете API в соответствии с настоящими Условиями, [Правилами контента](/legal/rules) и действующим законодательством;
- Не нарушаете права третьих лиц;
- Содействуете нам в соблюдении применимого законодательства.

Вы обязуетесь возмещать и защищать нас от любых претензий, исков и требований, возникающих в связи с вашим использованием API.

## Интеллектуальная собственность

За исключением Игрового контента, весь Сервис, его содержимое, дизайн, программное обеспечение, тексты, изображения и другие элементы принадлежат нам или нашим лицензиарам и защищены законами США и международным законодательством об авторском праве, товарных знаках, патентах и коммерческой тайне.

Настоящие Условия разрешают только личное, некоммерческое использование. Никакие права собственности на Сервис вам не передаются, все права, прямо не предоставленные, сохраняются за нами.

## Товарные знаки

Название Modifold, логотип и связанные с ними элементы являются нашими товарными знаками. Их использование без предварительного письменного разрешения запрещено. Остальные названия и логотипы принадлежат своим правообладателям.

## Запрещённое использование

Сервис можно использовать только в законных целях и в соответствии с настоящими Условиями. Запрещается:
- Нарушать любое применимое законодательство;
- Эксплуатировать или подвергать опасности несовершеннолетних;
- Загружать контент, нарушающий наши [Правила контента](/legal/rules);
- Распространять рекламу, спам или аналогичные материалы;
- Выдавать себя за нас, наших сотрудников или других пользователей;
- Препятствовать использованию Сервиса другими лицами.

Также запрещено:
- Использовать роботов, пауков, скрипты и любые автоматические средства доступа без разрешения;
- Внедрять вирусы, трояны или иной вредоносный код;
- Пытаться получить несанкционированный доступ к Сервису, его серверам или данным;
- Организовывать DoS- или DDoS-атаки.

## Пользовательский контент (не Игровой)

Сервис может содержать интерактивные функции (профили, посты, комментарии и т.п. — «Интерактивные сервисы»), позволяющие публиковать пользовательский контент (не являющийся Игровым контентом — «Пользовательские материалы»).

Все Пользовательские материалы обязаны соответствовать нашим [Правилам контента](/legal/rules).

Публикуя Пользовательские материалы, вы предоставляете нам и нашим поставщикам услуг неисключительное, безвозмездное право использовать, воспроизводить, модифицировать, показывать и распространять их в рамках настроек вашего аккаунта. Вы гарантируете, что обладаете всеми правами на свои Пользовательские материалы и они не нарушают настоящие Условия.

Вы несёте полную ответственность за законность, достоверность и уместность ваших Пользовательских материалов. Мы не несем ответственности за их содержание.

## Правила контента

Весь Игровой контент и Пользовательские материалы должны:
- Быть точными и не вводить в заблуждение;
- Не нарушать права третьих лиц на интеллектуальную собственность;
- Не содержать незаконный, оскорбительный, клеветнический или непристойный материал;
- Не содержать вирусы и вредоносный код;
- Соответствовать всем применимым законам.

Мы вправе удалять или отказывать в публикации любого контента, нарушающего данные требования.

## Мониторинг, обеспечение соблюдения и прекращение доступа

Мы вправе:
- Удалять или отказывать в публикации Пользовательских материалов;
- Принимать меры в отношении нарушений, включая нарушение прав, угрозу безопасности и создание ответственности;
- Передавать информацию правоохранительным органам;
- В любой момент приостановить или прекратить ваш доступ к Сервису.

Вы отказываетесь от любых претензий к нам в связи с такими действиями.

## Нарушение авторских прав

Если вы считаете, что какой-либо контент нарушает ваши авторские права — обращайтесь на [support@modifold.com](mailto:support@modifold.com) для получения инструкций по подаче уведомления. Мы вправе прекращать аккаунты повторных нарушителей.

## Ограничение ответственности

Сервис и вся информация предоставляются «как есть», без каких-либо гарантий. Мы не гарантируем точность, полноту, безопасность, бесперебойную работу Сервиса или отсутствие вирусов в загружаемых файлах.

Мы не несём ответственности за любые прямые, косвенные, случайные, специальные, штрафные или последующие убытки, возникшие в связи с использованием (или невозможностью использования) Сервиса.

Максимальный размер нашей ответственности ограничен суммой, которую вы уплатили нам (если уплачивали) за последние три месяца.

## Возмещение убытков

Вы обязуетесь защищать, возмещать и ограждать нас от любых претензий, убытков, расходов (включая судебные издержки), возникающих в связи с нарушением вами настоящих Условий или использованием Сервиса.

## Применимое право и юрисдикция

Настоящие Условия регулируются законодательством штата Делавэр, США. Любые споры подлежат рассмотрению исключительно в судах штата Делавэр (или федеральных судах США на территории Делавэра). Мы вправе также предъявлять иски в вашей стране проживания.

## Арбитраж

По нашему усмотрению споры могут передаваться на обязательный арбитраж в соответствии с Правилами Американской арбитражной ассоциации.

## Срок исковой давности

Любой иск должен быть подан в течение 1 года с момента возникновения основания для иска, иначе он считается погашенным.

## Полное соглашение

Настоящие Условия использования и [Политика конфиденциальности](/legal/privacy) составляют полное соглашение между вами и нами относительно использования Сервиса.

## Ваши обращения

По любым вопросам, предложениям и жалобам — пишите на [support@modifold.com](mailto:support@modifold.com).
`;

export default function TermsOfUse() {
    const [lang, setLang] = useState("en");

    const content = lang === "en" ? contentRulesEN : contentRulesRU;

    const pathname = usePathname();
    const isActive = (href) => pathname === href;

    return (
        <div className="layout">
            <div className="page-content settings-page">
                <div className="sidebar">
                    <div className="sidebar__main">
                        <Link href={`/legal/terms`} className={`sidebar-item ${isActive(`/legal/terms`) ? "sidebar-item--active" : ""}`} data-ripple>
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42"></path><path d="M12 5.36 8.87 8.5a2.13 2.13 0 0 0 0 3h0a2.13 2.13 0 0 0 3 0l2.26-2.21a3 3 0 0 1 4.22 0l2.4 2.4M18 15l-2-2M15 18l-2-2"></path></svg>

                            Terms of Use
                        </Link>

                        <Link href={`/legal/rules`} className={`sidebar-item ${isActive(`/legal/rules`) ? "sidebar-item--active" : ""}`} data-ripple>
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m3 6 3 1m0 0-3 9a5 5 0 0 0 6.001 0M6 7l3 9M6 7l6-2m6 2 3-1m-3 1-3 9a5 5 0 0 0 6.001 0M18 7l3 9m-3-9-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>

                            Content Rules
                        </Link>

                        <Link href={`/legal/privacy`} className={`sidebar-item ${isActive(`/legal/privacy`) ? "sidebar-item--active" : ""}`} data-ripple>
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>

                            Privacy Policy
                        </Link>

                        <Link href={`/legal/copyright`} className={`sidebar-item ${isActive(`/legal/copyright`) ? "sidebar-item--active" : ""}`} data-ripple>
                            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M15 9.354a4 4 0 1 0 0 5.292"></path></svg>

                            Copyright Policy
                        </Link>
                    </div>
                </div>

                <div className="content content--padding markdown-body">
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button onClick={() => setLang("en")} className={`button button--size-m ${lang === "en" ? "button--type-primary" : "button--type-secondary"}`}>
                            English
                        </button>

                        <button onClick={() => setLang("ru")} className={`button button--size-m ${lang === "ru" ? "button--type-primary" : "button--type-secondary"}`}>
                            Русский
                        </button>
                    </div>

                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({ href, children }) => {
                                const safeHref = getSafeMarkdownHref(href);
                                if(!safeHref) {
                                    return <>{children}</>;
                                }

                                const isExternal = /^https?:\/\//i.test(safeHref);
                                return (
                                    <a href={safeHref} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
                                        {children}
                                    </a>
                                );
                            },
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}