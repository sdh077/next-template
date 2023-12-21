/*global Microdraw*/
/*global paper*/

export var ToolOpenMenu = { openMenu : (function(){
    var tool = {

        /**
         * @function click
         * @desc closeMenu. close the side menu
         * @param {string} prevTool The previous tool to which the selection goes back
         * @returns {void}
         */
        click : function click(prevTool) {
            Microdraw.toggleMenu();
            Microdraw.backToPreviousTool(prevTool);
        }
    }
    
    return tool;
}())}