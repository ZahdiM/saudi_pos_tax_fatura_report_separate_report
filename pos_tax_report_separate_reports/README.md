# burke-decor-warehouse
Burke Decor Warehouse Management Apps developed in Odoo v14 Enterprise. 

Project URL: http://3.238.7.199:8069/

Prerequisite: git

Note: main brach is always for live database. So, merge with main only when you need to publish/deploy the changes to live theme. Pull the latest published theme before merge.

Step 1: Clone this repository:
git clone https://github.com/aivalabs/burke-decor-warehouse.git

Step 2: Create a new brach (append your name at the end)

git checkout -b <Branch Name>
  
Step 3: make your changes in your own branch and push it
  
git add . 
  
git commit -m 'your message for commit'
  
git push
  
Step 4: Merge with main branch to make it live
  
git checkout main
  
git merge your_own_branch
