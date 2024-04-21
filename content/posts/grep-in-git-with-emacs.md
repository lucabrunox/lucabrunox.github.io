---
title: 'Grep in git with emacs'
date: 2014-05-21T00:47:00.000-07:00
draft: false
url: /2014/05/grep-in-git-with-emacs.html
tags: 
- emacs
- git
---

I'm sure you're aware of [vc-git-grep](http://www.emacswiki.org/emacs/Git) command in Emacs, but it has a downside: you must specify the file extension every time, and it's case-sensitive.  
I propose you an alternative vc-git-grep2 that is case-insensitive and only requires the directory in which to start the search.  
  
```
(defun vc-git-grep2 (regexp dir)
  (interactive
   (progn
     (grep-compute-defaults)
     (cond
      ((equal current-prefix-arg '(16))
       (list (read-from-minibuffer "Run: " "git grep" nil nil 'grep-history)
    nil))
      (t (let\* ((regexp (grep-read-regexp))
    (dir (read-directory-name "In directory: " nil default-directory t)))
     (list regexp dir))))))
  (require 'grep)
  (when (and (stringp regexp) (\> (length regexp) 0))
    (let ((command regexp))
      (if (\> 4 5)
    (if (string\= command "git grep")
     (setq command nil))
  (setq dir (file-name-as-directory (expand-file-name dir)))
  (setq command
     (grep-expand-template "git grep -n -i -e <R>" regexp))
  (when command
    (if (equal current-prefix-arg '(4))
     (setq command
     (read-from-minibuffer "Confirm: " command nil nil 'grep-history))
   (add-to-history 'grep-history command))))
      (when command
  (let ((default-directory dir)
     (compilation-environment '("PAGER=")))
    ;; Setting process-setup-function makes exit-message-function work
    ;; even when async processes aren't supported.
    (compilation-start command 'grep-mode))
  (if (eq next-error-last-buffer (current-buffer))
   (setq default-directory dir))))))
 
```
Plus I suggest you to add the following to your .emacs. Install find-file-in-git-repo and add the following: (require 'find-file-in-git-repo) (global-set-key (kbd "C-x f") 'find-file-in-git-repo) Then bind our new vc-git-grep2: (global-set-key (kbd "C-x s") 'vc-git-grep2) Finally, because some modes don't use the common C-c C-c to comment/uncomment regions: (global-set-key (kbd "C-c C-") 'comment-or-uncomment-region)