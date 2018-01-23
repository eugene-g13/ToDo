$(document).ready(function () {

    // Create an instance of Task Manager.
    var taskManager = new TaskManager();

    // Loads stored values.
    taskManager.LoadTasks();

    $('button#add').on('click', function () {
        $input = $('input#task-title');
        if ($input.val().trim() == '')
            return;
        taskManager.AddTask($input.val().trim());
        $input.val('');
    })

    // Fast adding tasks by pressing Enter key.
    $('input#task-title').keyup(function (e) {
        if (e.keyCode == 13) {
            $('button#add').trigger('click');
        }
    });

    $('.title').on('click', function () {
        taskManager.ChangeSorting();
    })

    $('button#save').on('click', function () {
        taskManager.SaveTasks();
    })

    $('button#clear-tasks').on('click', function () {
        taskManager.ClearTasks();
    })

    $('a.close').click(function () {
        $('#saved-success').hide();
    })

    // Class incapsulates task management.
    function TaskManager() {
        var self = this;
        var _currentUid = 0;
        var _tasks = [];
        var _reverse = true;

        // Add task.
        this.AddTask = function (title) {
            _tasks.push({ Id: uid(), Title: title, Done: false });
            self.Sort({ reverse: _reverse });
            self.Refresh();
        }

        // Edit task.
        this.EditTask = function (id) {

            var result = $.grep(_tasks, function (e) { return e.Id == id; });

            if (result.length == 0) {
                console.error('task with id {' + id + '} not found!');
            } else if (result.length == 1) {
                var newTitle = prompt('Enter new title', result[0].Title);
                if (newTitle.trim() === '')
                    return;
                result[0].Title = newTitle;
            } else {
                // multiple items found 
            }

            // Update view. Sort required.
            this.Sort({ reverse: _reverse });
            this.Refresh();
        }

        // Removes task from list of tasks.
        this.DeleteTask = function (id) {
            _tasks = _tasks.filter(function (obj) {
                return obj.Id !== +id;
            });
         
            // Update view. No need to use Refresh(). Just remove row.
            $('table input[id=' + id + ']').closest('tr').remove();
        }

        // Changes task's state.
        this.SwitchDone = function (id, checked) {
            var result = $.grep(_tasks, function (e) { return e.Id == id; });
            if (result.length == 0) {
                console.error('task with id {' + id + '} not found!');
            } else if (result.length == 1) {
                result[0].Done = checked;
            } else {
                // multiple items found 
            }
        }

        // Sorts tasks by their names.
        this.Sort = function (options) {

            // Expected to return 1 or -1 values.
            var lessVal = -1;
            if (options !== undefined && options.reverse)
                lessVal = -lessVal;

            _tasks.sort(function (a, b) {
                var x = a.Title.toLowerCase();
                var y = b.Title.toLowerCase();
                if (x < y) { return lessVal; }
                if (x > y) { return -lessVal; }
                return 0;
            });
        }

        // Changes sorting order
        this.ChangeSorting = function () {
            _reverse = !_reverse;
            self.Sort({ reverse: _reverse });
            self.Refresh();
        }

        // Refreshes tasks.
        this.Refresh = function () {
            var $body = $('table#tasks tbody');
            $body.empty();

            _tasks.forEach(function (task) {
                //<tr>
                //    <td><input id="1" type="checkbox" class="checkbox" /></td>
                //    <td>Title</td>
                //    <td><button id="edit" type="button" class="btn btn-xs btn-default">Edit</button></td>
                //    <td><button id="delete" type="button" class="btn btn-xs btn-default">Delete</button></td>
                //</tr>
                $body.append($('<tr>')
                    .append($('<td>')
                        .append($('<input>')
                            .attr('id', task.Id)
                            .attr('type', 'checkbox')
                            .prop('checked', task.Done)
                            .addClass('checkbox')))
                    .append($('<td>')
                        .text(task.Title))
                    .append($('<td>').
                        append($('<button>')
                            .attr('type', 'button')
                            .addClass('btn btn-xs btn-default')
                            .attr('id', 'edit')
                            .text('Edit')))
                    .append($('<td>').
                        append($('<button>')
                            .attr('type', 'button')
                            .attr('id', 'delete')
                            .addClass('btn btn-xs btn-default')
                            .text('Delete'))));
            });

            addEventHandlers();
        }

        // Saves tasks to storage.
        this.SaveTasks = function () {
            if (typeof (Storage) === "undefined") {
                console.log('Sorry! No Web Storage support..');
                return;
            }

            localStorage.setItem("mytasks", JSON.stringify(_tasks));
            $('#saved-success').show();
        }

        // Loads tasks from storage.
        this.LoadTasks = function () {
            if (typeof (Storage) === "undefined") {
                console.log('Sorry! No Web Storage support..');
                return;
            }

            _tasks = JSON.parse(localStorage.getItem("mytasks"));
            if (_tasks === undefined || _tasks === null) {
                _tasks = [];
            }

            updateUidIterator();
            self.Sort({ reverse: true });
            self.Refresh();
        }

        // Deletes all existing tasks.
        this.ClearTasks = function () {
            _tasks = [];
            self.Refresh();
        }

        function addEventHandlers() {
            $('table input:checkbox').on('change', function () {
                taskManager.SwitchDone($(this).attr('id'), this.checked);
            });

            $('table button#edit').on('click', function () {
                taskManager.EditTask($(this).closest('tr').find('input').attr('id'));
            });

            $('table button#delete').on('click', function () {
                taskManager.DeleteTask($(this).closest('tr').find('input').attr('id'));
            });
        }

        // Updates uid iterator value. Finds max id and assing it to _currentUid.
        function updateUidIterator() {
            _tasks.forEach(function (task) {
                if (task.Id > _currentUid)
                    _currentUid = task.Id;
            })
        }

        // uid generator
        function uid() {
            return ++_currentUid;
        }

        return this;
    }

});