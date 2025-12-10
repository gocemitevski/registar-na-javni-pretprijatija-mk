export function socialLinkButtons(
  title = document.title,
  location = window.location.href
) {
  return [
    {
      name: "twitter-x",
      title: "Twitter/X",
      href:
        "https://twitter.com/share?text=" +
        encodeURIComponent(title) +
        "&url=" +
        encodeURIComponent(location),
      icon: "bi-twitter-x",
    },
    {
      name: "facebook",
      title: "Facebook",
      href:
        "https://www.facebook.com/sharer.php?t=" +
        encodeURIComponent(title) +
        "&u=" +
        encodeURIComponent(location),
      icon: "bi-facebook",
    },
    {
      name: "linkedin",
      title: "LinkedIn",
      href:
        "http://www.linkedin.com/shareArticle?mini=true&url=" +
        encodeURIComponent(location) +
        "&title=" +
        encodeURIComponent(title),
      icon: "bi-linkedin",
    },
  ];
}
